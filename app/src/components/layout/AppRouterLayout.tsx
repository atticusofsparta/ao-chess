import { Outlet } from 'react-router-dom';

import SigningModal from '../modals/SigningModal';
import Navbar from '../navigation/Navbar';
import ProfileMenu from '../navigation/ProfileMenu';
import Notifications from './Notifications';

function AppRouterLayout() {
  return (
    <div className="relative flex h-screen w-full flex-col">
      <Navbar />
      <div className="relative flex size-full w-full flex-col bg-background px-[50px] text-white">
        <Outlet />
      </div>
      <ProfileMenu />
      <SigningModal />
      <Notifications />
    </div>
  );
}

export default AppRouterLayout;
