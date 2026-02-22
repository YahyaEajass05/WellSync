import React from "react";
import { render, screen } from "@testing-library/react";
import { TableSkeleton, CardSkeleton, DashboardSkeleton } from "@/components/ui/loading-skeleton";

describe("TableSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<TableSkeleton />);
    expect(container).toBeInTheDocument();
  });
  it("renders default 5 rows", () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(5);
  });
  it("renders custom number of rows", () => {
    const { container } = render(<TableSkeleton rows={3} />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(3);
  });
  it("renders table header", () => {
    const { container } = render(<TableSkeleton />);
    expect(container.querySelector("thead")).toBeInTheDocument();
  });
});

describe("CardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<CardSkeleton />);
    expect(container).toBeInTheDocument();
  });
  it("contains skeleton elements", () => {
    const { container } = render(<CardSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("DashboardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container).toBeInTheDocument();
  });
  it("renders 4 card skeletons in grid", () => {
    const { container } = render(<DashboardSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
  it("renders a table inside dashboard skeleton", () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.querySelector("table")).toBeInTheDocument();
  });
});