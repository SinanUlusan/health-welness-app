import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewSlider } from "../ReviewSlider";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../services/api", () => ({
  apiService: {
    getReviews: vi.fn(() =>
      Promise.resolve({
        success: true,
        data: [
          {
            id: "1",
            title: "Great app!",
            content: "Really helped me",
            reviewer: "John Doe",
            stars: 5,
            emoji: "😊",
          },
        ],
      })
    ),
  },
}));

vi.mock("../services/analytics", () => ({
  trackUserInteraction: vi.fn(),
}));

describe("ReviewSlider Component", () => {
  it("should render review slider", () => {
    render(<ReviewSlider />);

    // Check if the component renders without crashing
    expect(
      screen.getByText("Please wait while we load the latest reviews...")
    ).toBeInTheDocument();
  });

  it("should render loading state", () => {
    render(<ReviewSlider />);

    // Check if loading state is rendered
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
