import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "@/app/(auth)/login/page";

jest.mock("@/components/three/AuthBackground", () => ({ AuthBackground: () => <div data-testid="auth-bg" /> }));
jest.mock("@/components/layout/BackToHomeButton", () => ({ BackToHomeButton: () => <a href="/">Home</a> }));
jest.mock("@/components/layout/ThemeToggle", () => ({ ThemeToggle: () => <button>Theme</button> }));

const mockLogin = jest.fn();
jest.mock("@/lib/hooks/useAuth", () => ({
  useAuth: () => ({ login: mockLogin, isLoginLoading: false, loginError: null, isLoginError: false }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe("LoginPage", () => {
  beforeEach(() => { mockLogin.mockClear(); });

  it("renders the Welcome Back heading", () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
  });
  it("renders email input", () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
  it("renders password input", () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
  it("renders the sign in button", () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
  it("renders sign up link", () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });
  it("renders forgot password link", () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByText(/forgot/i)).toBeInTheDocument();
  });
  it("shows validation error for invalid email", async () => {
    render(<LoginPage />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });
  it("shows validation error for short password", async () => {
    render(<LoginPage />, { wrapper });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });
  it("calls login on valid submit", async () => {
    render(<LoginPage />, { wrapper });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: "test@example.com", password: "password123" });
    });
  });
});