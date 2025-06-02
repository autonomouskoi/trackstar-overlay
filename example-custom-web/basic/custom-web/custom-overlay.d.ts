import * as tspb from "/m/trackstar/pb/trackstar_pb.js";
type TrackUpdateCB = (tu: tspb.TrackUpdate) => void;
declare function start(container: HTMLDivElement): TrackUpdateCB;
export { start };
