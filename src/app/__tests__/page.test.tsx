
import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home component', () => {
  it('should render without crashing', () => {
    render(<Home />);
  });

  it('should display the main heading', () => {
    render(<Home />);
    const heading = screen.getByText('Unlock Your English Potential');
    expect(heading).toBeInTheDocument();
  });

  it('should have "Get Started", "Sign Up", and "Log In" buttons with correct links', () => {
    render(<Home />);
    const getStartedButton = screen.getByText('Get Started');
    const signUpButton = screen.getByText('Sign Up');
    const logInButton = screen.getByText('Log In');

    expect(getStartedButton).toBeInTheDocument();
    expect(getStartedButton.closest('a')).toHaveAttribute('href', '/lessons');

    expect(signUpButton).toBeInTheDocument();
    expect(signUpButton.closest('a')).toHaveAttribute('href', '/register');

    expect(logInButton).toBeInTheDocument();
    expect(logInButton.closest('a')).toHaveAttribute('href', '/login');
  });

  it('should display the "Key Features" section', () => {
    render(<Home />);
    const keyFeatures = screen.getByText('Key Features');
    expect(keyFeatures).toBeInTheDocument();
  });

  it('should display the "Engaging Lessons", "Interactive Quizzes", and "Supportive Community" sections', () => {
    render(<Home />);
    const engagingLessons = screen.getByText('Engaging Lessons');
    const interactiveQuizzes = screen.getByText('Interactive Quizzes');
    const supportiveCommunity = screen.getByText('Supportive Community');

    expect(engagingLessons).toBeInTheDocument();
    expect(interactiveQuizzes).toBeInTheDocument();
    expect(supportiveCommunity).toBeInTheDocument();
  });

  it('should display the footer with copyright text', () => {
    render(<Home />);
    const footerText = screen.getByText(/© 2024 eSchool. All rights reserved./i);
    expect(footerText).toBeInTheDocument();
  });
});
