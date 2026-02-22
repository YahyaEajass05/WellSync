module.exports = {
  Canvas: ({ children }) => children,
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({ camera: {}, gl: {}, scene: {} })),
  extend: jest.fn(),
};
