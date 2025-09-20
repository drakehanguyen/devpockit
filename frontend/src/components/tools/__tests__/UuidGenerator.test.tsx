import { render, screen } from '@testing-library/react';
import { UuidGenerator } from '../UuidGenerator';

describe('UuidGenerator Component', () => {
  it('should render the component', () => {
    render(<UuidGenerator />);

    expect(screen.getByText('UUID Generator')).toBeInTheDocument();
    expect(screen.getByText('Generate UUIDs in different versions and formats')).toBeInTheDocument();
  });

  it('should render version selector', () => {
    render(<UuidGenerator />);

    expect(screen.getByText('UUID Version')).toBeInTheDocument();
  });

  it('should render format toggle buttons', () => {
    render(<UuidGenerator />);

    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('🔤 Lowercase')).toBeInTheDocument();
    expect(screen.getByText('🔠 Uppercase')).toBeInTheDocument();
  });

  it('should render hyphens toggle buttons', () => {
    render(<UuidGenerator />);

    expect(screen.getByText('Hyphens')).toBeInTheDocument();
    expect(screen.getByText('➖ Include Hyphens')).toBeInTheDocument();
    expect(screen.getByText('🔗 Exclude Hyphens')).toBeInTheDocument();
  });

  it('should render quantity input', () => {
    render(<UuidGenerator />);

    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });

  it('should render generate button', () => {
    render(<UuidGenerator />);

    expect(screen.getByText('Generate UUIDs')).toBeInTheDocument();
  });

  it('should render example buttons', () => {
    render(<UuidGenerator />);

    expect(screen.getByText('v1 Examples')).toBeInTheDocument();
    expect(screen.getByText('v4 Examples')).toBeInTheDocument();
    expect(screen.getByText('v5 Examples')).toBeInTheDocument();
    expect(screen.getByText('v7 Examples')).toBeInTheDocument();
  });
});
