import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";

jest.mock("@/components/three/AuthBackground", () => ({ AuthBackground: () => <div /> }));
jest.mock("@/components/layout/BackToHomeButton", () => ({ BackToHomeButton: () => <a href="/">Home</a> }));
jest.mock("@/components/layout/ThemeToggle", () => ({ ThemeToggle: () => <button>Theme</button> }));
jest.mock("@/lib/api", () => ({
  authApi: { forgotPassword: jest.fn().mockResolvedValue(undefined) },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe("ForgotPasswordPage", () => {
  it("renders forgot password heading", () => {
    render(<ForgotPasswordPage />, { wrapper });
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });
  it("renders email address input", () => {
    render(<ForgotPasswordPage />, { wrapper });
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });
  it("renders send reset code button", () => {
    render(<ForgotPasswordPage />, { wrapper });
    expect(screen.getByRole("button", { name: /send reset code/i })).toBeInTheDocument();
  });
  it("renders back to login link", () => {
    render(<ForgotPasswordPage />, { wrapper });
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });
  it("renders don't have an account link", () => {
    render(<ForgotPasswordPage />, { wrapper });
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });
  it("shows validation error for empty email on submit", async () => {
    render(<ForgotPasswordPage />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: /send reset code/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
  it("shows validation error for empty submission", async () => {
    render(<ForgotPasswordPage />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: /send reset code/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
  it("shows success state after valid submit", async () => {
    render(<ForgotPasswordPage />, { wrapper });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /send reset code/i }));
    await waitFor(() => {
      expect(screen.getByText(/reset code sent/i)).toBeInTheDocument();
    });
  });
});