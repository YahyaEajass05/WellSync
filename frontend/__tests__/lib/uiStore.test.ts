import { act, renderHook } from '@testing-library/react';
import { useUIStore } from '@/lib/store/uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    act(() => { useUIStore.setState({ sidebarOpen: true }); });
  });

  it('has sidebarOpen true by default', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.sidebarOpen).toBe(true);
  });

  it('setSidebarOpen sets to false', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setSidebarOpen(false); });
    expect(result.current.sidebarOpen).toBe(false);
  });

  it('setSidebarOpen sets to true', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setSidebarOpen(false); });
    act(() => { result.current.setSidebarOpen(true); });
    expect(result.current.sidebarOpen).toBe(true);
  });

  it('toggleSidebar flips from true to false', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.toggleSidebar(); });
    expect(result.current.sidebarOpen).toBe(false);
  });

  it('toggleSidebar flips from false to true', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setSidebarOpen(false); });
    act(() => { result.current.toggleSidebar(); });
    expect(result.current.sidebarOpen).toBe(true);
  });

  it('multiple toggles work correctly', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.toggleSidebar(); });
    act(() => { result.current.toggleSidebar(); });
    expect(result.current.sidebarOpen).toBe(true);
  });
});
