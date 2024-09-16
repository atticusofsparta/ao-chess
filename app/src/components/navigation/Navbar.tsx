import { ConnectButton } from 'arweave-wallet-kit';
import { Link } from 'react-router-dom';

import ProfileButton from '../buttons/ProfileButton';

function Navbar() {
  return (
    <nav className="flex w-full flex-row items-center justify-between bg-foreground px-[50px] py-2">
      {/* left side */}
      <div className="text-2xl text-white underline">Chess</div>
      {/* right side */}
      <div className="flex flex-row items-center">
        <Link
          to={`/`}
          className="cursor-pointer px-2 text-white hover:text-primary"
        >
          Home
        </Link>
        <Link
          to={`/games`}
          className="cursor-pointer px-2 text-white hover:text-primary"
        >
          Games
        </Link>
        <Link
          to={`/tutorial`}
          className="cursor-pointer px-2 text-white hover:text-primary"
        >
          Tutorial
        </Link>
        <ProfileButton />
      </div>
    </nav>
  );
}

export default Navbar;
