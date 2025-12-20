"""
HR Interview Agent - Manages interview flow, questions, and scoring
"""
import os
from typing import List, Dict, Optional
from enum import Enum
from dotenv import load_dotenv
from agno.agent import Agent
from agno.models.groq import Groq
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()


class InterviewStage(str, Enum):
    """Interview stages"""
    INTRODUCTION = "introduction"
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    CONCLUSION = "conclusion"


class InterviewState(BaseModel):
    """Interview state tracking"""
    stage: InterviewStage = InterviewStage.INTRODUCTION
    questions_asked: int = 0
    current_question: Optional[str] = None
    responses: List[Dict[str, str]] = Field(default_factory=list)
    scores: List[float] = Field(default_factory=list)
    candidate_name: Optional[str] = None


class InterviewAgent:
    """HR Interview Agent using Agno with Groq"""
    
    def __init__(self, job_role: str = "Software Engineer", model_name: str = "llama-3.3-70b-versatile"):
        """
        Initialize the interview agent
        
        Args:
            job_role: The role being interviewed for
            model_name: Groq model to use
        """
        self.job_role = job_role
        self.state = InterviewState()
        
        # Initialize Agno agent with Groq
        self.agent = Agent(
            name="HR Interviewer",
            model=Groq(id=model_name),
            description=f"Professional HR interviewer conducting interviews for {job_role} position",
            instructions=[
                "You are a professional HR interviewer conducting a structured interview.",
                f"You are interviewing candidates for the {job_role} position.",
                "Be professional, friendly, and encouraging.",
                "Ask clear, relevant questions one at a time.",
                "Listen carefully to answers and ask follow-up questions when needed.",
                "Keep responses concise and conversational (2-3 sentences max).",
                "Don't use special formatting, emojis, or bullet points in speech.",
                "Speak naturally as if having a real conversation.",
            ],
            markdown=False,
            debug_mode=False,
        )
        
        # Interview questions by stage
        self.question_bank = {
            InterviewStage.TECHNICAL: [
                "Can you explain your experience with the technologies listed in your resume?",
                "Describe a challenging technical problem you've solved recently.",
                "How do you approach debugging when you encounter a difficult bug?",
                "What's your experience with version control and collaborative development?",
                "Can you walk me through your development process for a typical project?",
            ],
            InterviewStage.BEHAVIORAL: [
                "Tell me about a time when you had to work under tight deadlines.",
                "How do you handle disagreements with team members?",
                "Describe a situation where you had to learn something new quickly.",
                "What motivates you in your work?",
                "Where do you see yourself in the next 2-3 years?",
            ]
        }
    
    def get_introduction(self) -> str:
        """Get interview introduction"""
        self.state.stage = InterviewStage.INTRODUCTION
        
        intro = self.agent.run(
            f"Greet the candidate warmly and introduce yourself. "
            f"Explain that this is an interview for the {self.job_role} position. "
            f"Tell them the interview will have technical and behavioral questions. "
            f"Ask for their name and if they're ready to begin. Keep it brief and natural."
        )
        
        return intro.content if hasattr(intro, 'content') else str(intro)
    
    def process_candidate_response(self, transcript: str) -> str:
        """
        Process candidate's response and generate next question or feedback
        
        Args:
            transcript: What the candidate said
            
        Returns:
            Interviewer's response (next question or feedback)
        """
        # Extract name during introduction
        if self.state.stage == InterviewStage.INTRODUCTION and not self.state.candidate_name:
            # Simple name extraction (can be improved)
            words = transcript.strip().split()
            for i, word in enumerate(words):
                if word.lower() in ["i'm", "im", "i am", "my name is", "this is", "name's"]:
                    if i + 1 < len(words):
                        self.state.candidate_name = words[i + 1].strip(".,!?")
                        break
            
            # Move to technical questions
            self.state.stage = InterviewStage.TECHNICAL
            return self._ask_next_question()
        
        # Save the response
        self.state.responses.append({
            "question": self.state.current_question or "Introduction",
            "answer": transcript,
            "stage": self.state.stage
        })
        
        # Score the response (simple scoring for now)
        score = self._score_response(transcript)
        self.state.scores.append(score)
        
        # Progress through interview
        self.state.questions_asked += 1
        
        # Decide next action based on stage and questions asked
        if self.state.stage == InterviewStage.TECHNICAL and self.state.questions_asked >= 3:
            self.state.stage = InterviewStage.BEHAVIORAL
            self.state.questions_asked = 0
            return self._transition_to_behavioral()
        
        elif self.state.stage == InterviewStage.BEHAVIORAL and self.state.questions_asked >= 2:
            self.state.stage = InterviewStage.CONCLUSION
            return self._conclude_interview()
        
        else:
            # Ask follow-up or next question
            return self._ask_next_question()
    
    def _ask_next_question(self) -> str:
        """Ask the next question based on current stage and previous answers"""
        # Build context from previous responses
        context = ""
        if self.state.responses:
            last_response = self.state.responses[-1]
            context = f"\n\nThe candidate's last answer was: '{last_response['answer']}'"
        
        # Generate dynamic question using LLM
        if self.state.stage == InterviewStage.TECHNICAL:
            prompt = f"""You are conducting a technical interview for a {self.job_role} position.
            
Question number: {self.state.questions_asked + 1} of 3
Stage: Technical Questions
{context}

Generate ONE relevant technical question. Consider:
- Their previous answers and go deeper
- Technical skills needed for {self.job_role}
- Problem-solving abilities
- Real-world experience

Ask the question naturally in 1-2 sentences. Be conversational, not robotic."""

        elif self.state.stage == InterviewStage.BEHAVIORAL:
            prompt = f"""You are conducting a behavioral interview for a {self.job_role} position.
            
Question number: {self.state.questions_asked + 1} of 2
Stage: Behavioral Questions
{context}

Generate ONE relevant behavioral question. Focus on:
- Team collaboration and communication
- Handling challenges and pressure
- Work style and motivation
- Career goals

Ask the question naturally in 1-2 sentences. Be conversational."""

        else:
            return "Thank you for your time today."
        
        # Get LLM-generated question
        response = self.agent.run(prompt)
        question_text = response.content if hasattr(response, 'content') else str(response)
        
        self.state.current_question = question_text
        return question_text
    
    def _transition_to_behavioral(self) -> str:
        """Transition from technical to behavioral questions"""
        response = self.agent.run(
            "Thank the candidate for their technical answers. "
            "Now transition to behavioral questions to learn more about their work style. "
            "Keep it brief and natural."
        )
        return response.content if hasattr(response, 'content') else str(response)
    
    def _conclude_interview(self) -> str:
        """Conclude the interview with final score"""
        final_score = self.get_final_score()
        
        response = self.agent.run(
            f"Thank the candidate {self.state.candidate_name or ''} for their time. "
            f"Provide brief, encouraging feedback. "
            f"Mention that they scored {final_score['total_score']:.1f} out of 100. "
            f"Tell them the team will be in touch soon. Keep it warm and professional."
        )
        
        return response.content if hasattr(response, 'content') else str(response)
    
    def _score_response(self, transcript: str) -> float:
        """
        Score a response using LLM evaluation
        
        Args:
            transcript: Candidate's response
            
        Returns:
            Score from 0-100
        """
        question = self.state.current_question or "Previous question"
        stage = self.state.stage
        
        # Use LLM to evaluate the answer
        evaluation_prompt = f"""You are evaluating a candidate's interview answer.

Question asked: "{question}"
Stage: {stage}
Candidate's answer: "{transcript}"

Evaluate this answer on a scale of 0-100 based on:

For Technical Questions:
- Technical accuracy and depth (30 points)
- Specific examples and details (25 points)
- Clear communication (20 points)
- Problem-solving approach (15 points)
- Relevance to question (10 points)

For Behavioral Questions:
- Clarity and structure (30 points)
- Specific examples with context (30 points)
- Self-awareness and learning (20 points)
- Professional demeanor (20 points)

Respond with ONLY a number between 0 and 100. No explanation, just the score."""

        try:
            response = self.agent.run(evaluation_prompt)
            score_text = response.content if hasattr(response, 'content') else str(response)
            
            # Extract number from response
            import re
            numbers = re.findall(r'\d+', score_text)
            if numbers:
                score = float(numbers[0])
                return min(max(score, 0), 100)  # Clamp between 0-100
            else:
                # Fallback to basic scoring if LLM doesn't return a number
                return self._fallback_score(transcript)
        except Exception as e:
            print(f"Error in LLM scoring: {e}")
            return self._fallback_score(transcript)
    
    def _fallback_score(self, transcript: str) -> float:
        """Fallback scoring if LLM fails"""
        score = 50.0
        word_count = len(transcript.split())
        if 20 <= word_count <= 150:
            score += 20
        elif word_count >= 10:
            score += 10
        technical_keywords = ['project', 'team', 'developed', 'implemented', 'designed', 
                            'experience', 'used', 'worked', 'built', 'created']
        keyword_count = sum(1 for word in technical_keywords if word in transcript.lower())
        score += min(keyword_count * 5, 30)
        return min(score, 100.0)
    
    def get_final_score(self) -> Dict[str, float]:
        """Calculate final interview score"""
        if not self.state.scores:
            return {
                "total_score": 0.0, 
                "average_score": 0.0,
                "technical_avg": 0.0,
                "behavioral_avg": 0.0
            }
        
        average_score = sum(self.state.scores) / len(self.state.scores)
        
        # Weight by stage (technical 60%, behavioral 40%)
        technical_scores = [s for i, s in enumerate(self.state.scores) 
                          if i < len([r for r in self.state.responses if r['stage'] == InterviewStage.TECHNICAL])]
        behavioral_scores = [s for i, s in enumerate(self.state.scores) 
                           if i >= len(technical_scores)]
        
        if technical_scores and behavioral_scores:
            weighted_score = (sum(technical_scores) / len(technical_scores) * 0.6 + 
                            sum(behavioral_scores) / len(behavioral_scores) * 0.4)
        else:
            weighted_score = average_score
        
        return {
            "total_score": weighted_score,
            "average_score": average_score,
            "technical_avg": sum(technical_scores) / len(technical_scores) if technical_scores else 0,
            "behavioral_avg": sum(behavioral_scores) / len(behavioral_scores) if behavioral_scores else 0,
        }
    
    def reset(self):
        """Reset interview state for new candidate"""
        self.state = InterviewState()
