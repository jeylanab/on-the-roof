import { useState } from 'react';
import Header from './Header';
import TabNav from './TabNav';
import RoofingPage from './RoofingPage';
import SidingPage from './SidingPage';
import FasciaGutterPage from './FasciaGutterPage';
import SummaryPage from './SummaryPage';
import WorkOrderPage from './WorkOrderPage';
import AdminPage from './AdminPage';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const pages = [
    <RoofingPage />,
    <SidingPage />,
    <FasciaGutterPage />,
    <SummaryPage onGoToWorkOrder={() => setActiveTab(4)} />,
    <WorkOrderPage />,
    <AdminPage />,
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-3">
      <div className="max-w-[900px] mx-auto">
        <Header />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div>{pages[activeTab]}</div>
      </div>
    </div>
  );
}