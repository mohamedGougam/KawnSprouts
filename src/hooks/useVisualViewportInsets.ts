import { useEffect, useState } from 'react';

const KEYBOARD_THRESHOLD_PX = 120;

export function useVisualViewportInsets() {
  const [state, setState] = useState({ keyboardOpen: false, bottomInset: 0 });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const obscured = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setState({
        keyboardOpen: obscured > KEYBOARD_THRESHOLD_PX,
        bottomInset: obscured,
      });
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return state;
}
