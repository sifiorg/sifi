import { useSpaceTravel } from 'src/providers/SpaceTravelProvider';

const SPACE_TRAVEL_CANVAS_ID = 'space-travel';

const SpaceTravelCanvas = () => {
  useSpaceTravel();

  return <canvas id={SPACE_TRAVEL_CANVAS_ID} className="fixed w-screen h-screen" />;
};

export { SpaceTravelCanvas, SPACE_TRAVEL_CANVAS_ID };
