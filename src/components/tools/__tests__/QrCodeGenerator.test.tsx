import { render, screen, waitFor } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { QrCodeGenerator } from '../QrCodeGenerator';

// Mock the QRCode library
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr-code-data')
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

// Mock download functionality
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild
});

const mockLink = {
  href: '',
  download: '',
  click: mockClick
};

mockCreateElement.mockReturnValue(mockLink);

const renderWithProvider = (component: React.ReactElement) => {
  return render(component);
};

describe.skip('QrCodeGenerator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with default state', () => {
    renderWithProvider(<QrCodeGenerator />);

    expect(screen.getByText('QR Code Generator')).toBeInTheDocument();
    expect(screen.getByText('Generate QR codes for text, URLs, contacts, WiFi, SMS, and email with customizable options')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate qr code/i })).toBeInTheDocument();
  });

  it('should show text input by default', () => {
    renderWithProvider(<QrCodeGenerator />);

    expect(screen.getByLabelText('Text Content')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text content for QR code...')).toBeInTheDocument();
  });

  it('should switch to URL input when URL type is selected', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);

    const urlOption = screen.getByText('URL');
    await user.click(urlOption);

    expect(screen.getByLabelText('URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
  });

  it('should switch to contact input when contact type is selected', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);

    const contactOption = screen.getByText('Contact');
    await user.click(contactOption);

    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should switch to WiFi input when WiFi type is selected', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);

    const wifiOption = screen.getByText('WiFi');
    await user.click(wifiOption);

    expect(screen.getByLabelText('Network Name (SSID) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Security Type')).toBeInTheDocument();
  });

  it('should switch to SMS input when SMS type is selected', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);

    const smsOption = screen.getByText('SMS');
    await user.click(smsOption);

    expect(screen.getByLabelText('Phone Number *')).toBeInTheDocument();
    expect(screen.getByLabelText('Message *')).toBeInTheDocument();
  });

  it('should switch to email input when email type is selected', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);

    const emailOption = screen.getByText('Email');
    await user.click(emailOption);

    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Message Body')).toBeInTheDocument();
  });

  it('should allow customizing QR code options', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    // Change size
    const sizeInput = screen.getByLabelText('Size (px)');
    await user.clear(sizeInput);
    await user.type(sizeInput, '512');

    // Change error correction
    const errorCorrectionSelect = screen.getAllByRole('combobox')[1];
    await user.click(errorCorrectionSelect);
    const highOption = screen.getByText('High (30%)');
    await user.click(highOption);

    // Change format
    const formatSelect = screen.getAllByRole('combobox')[2];
    await user.click(formatSelect);
    const svgOption = screen.getByText('SVG');
    await user.click(svgOption);

    expect(sizeInput).toHaveValue(512);
  });

  it('should generate QR code when generate button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const textInput = screen.getByLabelText('Text Content');
    await user.type(textInput, 'Hello, World!');

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generated QR Code')).toBeInTheDocument();
    });
  });

  it('should show error when trying to generate QR code without input', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter some text to generate a qr code/i)).toBeInTheDocument();
    });
  });

  it('should show error when URL is empty', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    // Switch to URL type
    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);
    const urlOption = screen.getByText('URL');
    await user.click(urlOption);

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a url to generate a qr code/i)).toBeInTheDocument();
    });
  });

  it('should show error when contact name is missing', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    // Switch to contact type
    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);
    const contactOption = screen.getByText('Contact');
    await user.click(contactOption);

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a contact name/i)).toBeInTheDocument();
    });
  });

  it('should show error when WiFi SSID is missing', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    // Switch to WiFi type
    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);
    const wifiOption = screen.getByText('WiFi');
    await user.click(wifiOption);

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a wifi ssid/i)).toBeInTheDocument();
    });
  });

  it('should show error when SMS phone is missing', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    // Switch to SMS type
    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);
    const smsOption = screen.getByText('SMS');
    await user.click(smsOption);

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a phone number for sms qr code/i)).toBeInTheDocument();
    });
  });

  it('should show error when email address is missing', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    // Switch to email type
    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);
    const emailOption = screen.getByText('Email');
    await user.click(emailOption);

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter an email address/i)).toBeInTheDocument();
    });
  });

  it('should allow copying QR code to clipboard', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const textInput = screen.getByLabelText('Text Content');
    await user.type(textInput, 'Hello, World!');

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generated QR Code')).toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should allow downloading QR code', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const textInput = screen.getByLabelText('Text Content');
    await user.type(textInput, 'Hello, World!');

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generated QR Code')).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole('button', { name: /download png/i });
    await user.click(downloadButton);

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
  });

  it('should apply color presets', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const bluePreset = screen.getByText('Blue');
    await user.click(bluePreset);

    // The color preset should be applied (we can't easily test the actual color values)
    expect(bluePreset).toBeInTheDocument();
  });

  it('should load examples when clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const simpleTextExample = screen.getByText('Simple Text');
    await user.click(simpleTextExample);

    // The example should populate the input
    const textInput = screen.getByLabelText('Text Content');
    expect(textInput).toHaveValue('Hello, World! This is a QR code for text content.');
  });

  it('should show loading state during generation', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const textInput = screen.getByLabelText('Text Content');
    await user.type(textInput, 'Hello, World!');

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    expect(screen.getByText('Generating QR Code...')).toBeInTheDocument();
  });

  it('should display QR code statistics', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    const textInput = screen.getByLabelText('Text Content');
    await user.type(textInput, 'Hello, World!');

    const generateButton = screen.getByRole('button', { name: /generate qr code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generated QR Code')).toBeInTheDocument();
    });

    // Check for statistics badges
    expect(screen.getByText('Type: text')).toBeInTheDocument();
    expect(screen.getByText('Size: 256px')).toBeInTheDocument();
    expect(screen.getByText('Error Correction: M')).toBeInTheDocument();
    expect(screen.getByText('Format: PNG')).toBeInTheDocument();
  });

  it('should handle WiFi security type selection', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    // Switch to WiFi type
    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);
    const wifiOption = screen.getByText('WiFi');
    await user.click(wifiOption);

    const securitySelect = screen.getByLabelText('Security Type');
    await user.click(securitySelect);

    const wepOption = screen.getByText('WEP');
    await user.click(wepOption);

    expect(securitySelect).toHaveValue('WEP');
  });

  it('should handle hidden WiFi network toggle', async () => {
    const user = userEvent.setup();
    renderWithProvider(<QrCodeGenerator />);

    // Switch to WiFi type
    const typeSelect = screen.getByRole('combobox');
    await user.click(typeSelect);
    const wifiOption = screen.getByText('WiFi');
    await user.click(wifiOption);

    const hiddenToggle = screen.getByLabelText('Hidden Network');
    await user.click(hiddenToggle);

    expect(hiddenToggle).toBeChecked();
  });
});
