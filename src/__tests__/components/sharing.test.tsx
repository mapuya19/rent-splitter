/**
 * Tests for the sharing functionality in the main page component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import Home from '@/app/page';

// Mock the API calls
global.fetch = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock window.location
delete (window as unknown).location;
window.location = { origin: 'http://localhost:3000' } as Location;

describe('Sharing Functionality', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    (navigator.clipboard.writeText as jest.Mock).mockClear();
  });

  it('should handle successful sharing', async () => {
    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, id: 'test123' }),
    });

    // Mock successful clipboard write
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValueOnce(undefined);

    // Mock alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<Home />);

    // Add some test data
    const rentInput = screen.getByLabelText(/total rent/i);
    fireEvent.change(rentInput, { target: { value: '2000' } });

    // Add a roommate
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Alice' } });

    const incomeInput = screen.getByLabelText(/annual income/i);
    fireEvent.change(incomeInput, { target: { value: '60000' } });

    // Wait for the share button to appear (it only shows when there are results)
    await waitFor(() => {
      const shareButton = screen.queryByText(/share/i);
      if (shareButton) {
        fireEvent.click(shareButton);
      }
    });

    // Verify API was called
    expect(fetch).toHaveBeenCalledWith('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"totalRent":2000'),
    });

    // Verify clipboard was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3000?share=')
    );

    // Verify success message
    expect(alertSpy).toHaveBeenCalledWith('Shareable link copied to clipboard!');

    alertSpy.mockRestore();
  });

  it('should handle sharing API failure', async () => {
    // Mock failed API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    // Mock alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<Home />);

    // Add test data
    const rentInput = screen.getByLabelText(/total rent/i);
    fireEvent.change(rentInput, { target: { value: '2000' } });

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Alice' } });

    const incomeInput = screen.getByLabelText(/annual income/i);
    fireEvent.change(incomeInput, { target: { value: '60000' } });

    // Wait for share button and click it
    await waitFor(() => {
      const shareButton = screen.queryByText(/share/i);
      if (shareButton) {
        fireEvent.click(shareButton);
      }
    });

    // Verify error message
    expect(alertSpy).toHaveBeenCalledWith('Failed to create shareable link. Please try again.');

    alertSpy.mockRestore();
  });

  it('should handle clipboard failure gracefully', async () => {
    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, id: 'test123' }),
    });

    // Mock clipboard failure
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
      new Error('Clipboard access denied')
    );

    // Mock alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<Home />);

    // Add test data
    const rentInput = screen.getByLabelText(/total rent/i);
    fireEvent.change(rentInput, { target: { value: '2000' } });

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Alice' } });

    const incomeInput = screen.getByLabelText(/annual income/i);
    fireEvent.change(incomeInput, { target: { value: '60000' } });

    // Wait for share button and click it
    await waitFor(() => {
      const shareButton = screen.queryByText(/share/i);
      if (shareButton) {
        fireEvent.click(shareButton);
      }
    });

    // Should still show success message even if clipboard fails
    expect(alertSpy).toHaveBeenCalledWith('Shareable link copied to clipboard!');

    alertSpy.mockRestore();
  });

  it('should load shared data on page load', async () => {
    const sharedData = {
      totalRent: 3000,
      utilities: 400,
      customExpenses: [
        { id: 'exp1', name: 'Internet', amount: 75 }
      ],
      roommates: [
        { id: 'roommate1', name: 'Alice', income: 70000 }
      ]
    };

    // Mock successful API response for loading shared data
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: sharedData }),
    });

    // Mock URL with share parameter
    const originalLocation = window.location;
    delete (window as unknown).location;
    window.location = {
      ...originalLocation,
      search: '?share=test123',
    } as Location;

    render(<Home />);

    // Wait for the shared data to be loaded
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/share?id=test123');
    });

    // Verify the data was loaded (this would require checking the form values)
    // Note: This is a simplified test - in a real scenario you'd check the actual form values
  });
});
