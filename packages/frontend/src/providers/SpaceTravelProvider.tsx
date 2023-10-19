import { FC, PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';
import SpaceTravel from '../space-travel/space-travel';
import { SPACE_TRAVEL_CANVAS_ID } from 'src/space-travel/SpaceTravelCanvas';

const defaultSetStateAction = () => {
  throw new Error('Function not implemented. This function is provided by SpaceTravelProvider.');
};

const SpaceTravelContext = createContext<{
  scene: SpaceTravel | null;
  setThrottle: React.Dispatch<React.SetStateAction<number>>;
  throttle: number;
}>({
  scene: null,
  setThrottle: defaultSetStateAction,
  throttle: 0,
});

const useSpaceTravel = () => useContext(SpaceTravelContext);

const SpaceTravelProvider: FC<PropsWithChildren> = ({ children }) => {
  const [throttle, setThrottle] = useState(0);
  const [scene, setScene] = useState<SpaceTravel | null>(null);

  useEffect(() => {
    const spaceTravelCanvas = document.getElementById(SPACE_TRAVEL_CANVAS_ID);

    if (spaceTravelCanvas instanceof HTMLCanvasElement) {
      const scene = new SpaceTravel({
        canvas: spaceTravelCanvas,
      });

      scene.start();
      setScene(scene);
    } else {
      console.error(`Element with id ${SPACE_TRAVEL_CANVAS_ID} is not a canvas or does not exist`);
    }
  }, []);

  useEffect(() => {
    if (scene) {
      scene.throttle = throttle;
    }
  }, [scene, throttle]);

  return (
    <SpaceTravelContext.Provider value={{ scene, throttle, setThrottle }}>
      {children}
    </SpaceTravelContext.Provider>
  );
};

export { SpaceTravelProvider, useSpaceTravel };
