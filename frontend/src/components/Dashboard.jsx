import CrowdGraph from "./CrowdGraph";
import AlertPanel from "./AlertPanel";

export default function Dashboard({ alerts }) {
  return (
    <div className="dashboard">
      <CrowdGraph />
      <AlertPanel alerts={alerts} />
    </div>
  );
}