import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RegisterPage from "@/app/(auth)/register/page";

jest.mock("@/components/three/AuthBackground", () => ({ AuthBackground: () => <div /> }));
jest.mock("@/components/layout/BackToHomeButton", () => ({ BackToHomeButton: () => <a href="/">Home</a> }));
jest.mock("@/components/layout/ThemeToggle", () => ({ ThemeToggle: () => <button>Theme</button> }));

const mockRegister = jest.fn();
jest.mock("@/lib/hooks/useAuth", () => ({
  useAuth: () => ({ register: mockRegister, isRegisterLoading: false }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe("RegisterPage", () => {
  beforeEach(() => { mockRegister.mockClear(); });

  it("renders the create account heading", () => {
    render(<RegisterPage />, { wrapper });
    const headings = screen.getAllByText(/create account/i);
    expect(headings.length).toBeGreaterThan(0);
  });
  it("renders first name input", () => {
    render(<RegisterPage />, { wrapper });
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });
  it("renders last name input", () => {
    render(<RegisterPage />, { wrapper });
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
  });
  it("renders email input", () => {
    render(<RegisterPage />, { wrapper });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
  it("renders submit button", () => {
    render(<RegisterPage />, { wrapper });
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });
  it("renders sign in link", () => {
    render(<RegisterPage />, { wrapper });
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
  it("shows error if passwords do not match", async () => {
    render(<RegisterPage />, { wrapper });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "different123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords don.t match/i)).toBeInTheDocument();
    });
  });
  it("calls register with form data on valid submit", async () => {
    render(<RegisterPage />, { wrapper });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });
});