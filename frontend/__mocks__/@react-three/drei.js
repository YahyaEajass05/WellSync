module.exports = {
  OrbitControls: jest.fn(),
  PerspectiveCamera: jest.fn(),
  Stars: jest.fn(),
  Float: ({ children }) => children,
  Text: jest.fn(),
  Environment: jest.fn(),
  EffectComposer: jest.fn(),
};
