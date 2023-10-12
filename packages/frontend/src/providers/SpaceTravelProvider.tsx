import { FC, PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';
import SpaceTravel from 'space-travel';

const SpaceTravelContext = createContext<{
  scene: any;
  setThrottle: any;
  setThrottleLerpFactor: any;
  throttle: number;
}>({ scene: null, setThrottle: null, setThrottleLerpFactor: null, throttle: 0 });

const useSpaceTravel = () => useContext(SpaceTravelContext);

const SpaceTravelProvider: FC<PropsWithChildren> = ({ children }) => {
  const [throttle, setThrottle] = useState(0);
  const [throttleLerpFactor, setThrottleLerpFactor] = useState(0.02);
  const [scene, setScene] = useState<any | null>(null);

  useEffect(() => {
    const spaceTravelCanvas = document.getElementById('space-travel');

    if (spaceTravelCanvas instanceof HTMLCanvasElement) {
      const scene = new SpaceTravel({
        canvas: spaceTravelCanvas,
        throttleLerpFactor,
      });

      scene.start();
      setScene(scene);
    } else {
      console.error('Element with id "space-travel" is not a canvas or does not exist');
    }
  }, []);

  useEffect(() => {
    if (scene) {
      scene.throttle = throttle;
      scene.throttleLerpFactor = throttleLerpFactor;
      console.log(scene);
    }
  }, [scene, throttle, throttleLerpFactor]);

  return (
    <SpaceTravelContext.Provider value={{ scene, throttle, setThrottle, setThrottleLerpFactor }}>
      {children}
    </SpaceTravelContext.Provider>
  );
};

export { SpaceTravelProvider, useSpaceTravel };
