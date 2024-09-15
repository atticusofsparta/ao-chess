import { AoSigner } from '@ar.io/sdk';
import { createDataItemSigner } from '@permaweb/aoconnect';
import { wrapCreateBrowserRouter } from '@sentry/react';
import { useActiveAddress, useApi } from 'arweave-wallet-kit';
import React, { Suspense, useEffect } from 'react';
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import { mountStoreDevtool } from 'simple-zustand-devtools';

import AppRouterLayout from './components/layout/AppRouterLayout';
import NotFound from './pages/NotFound';
import { errorEmitter } from './services/events';
import { useGlobalState } from './services/state/useGlobalState';

const Home = React.lazy(() => import('./pages/Home'));
const Games = React.lazy(() => import('./pages/Games'));
const Game = React.lazy(() => import('./pages/Game'));
const Tutorial = React.lazy(() => import('./pages/Tutorial'));

const sentryCreateBrowserRouter = wrapCreateBrowserRouter(createBrowserRouter);

function App() {
  mountStoreDevtool('useGlobalState', useGlobalState);
  const api = useApi();
  const activeAddress = useActiveAddress();
  const setAddress = useGlobalState((state) => state.setAddress);
  const setAoSigner = useGlobalState((state) => state.setAoSigner);
  const updateProfiles = useGlobalState((state) => state.updateProfiles);
  const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
      <Route element={<AppRouterLayout />} errorElement={<NotFound />}>
        <Route
          index
          element={
            <Suspense
              fallback={<div className="center flex flex-row">Loading</div>}
            >
              <Home />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense
              fallback={<div className="center flex flex-row">Loading</div>}
            >
              <NotFound />
            </Suspense>
          }
        />
        <Route
          path="games"
          element={
            <Suspense
              fallback={<div className="center flex flex-row">Loading</div>}
            >
              <Games />
            </Suspense>
          }
        >
          <Route
            path=":gameId"
            element={
              <Suspense
                fallback={<div className="center flex flex-row">Loading</div>}
              >
                <Game />
              </Suspense>
            }
          />
        </Route>
        <Route
          path={'tutorial'}
          element={
            <Suspense
              fallback={<div className="center flex flex-row">Loading</div>}
            >
              <Tutorial />
            </Suspense>
          }
        />
      </Route>,
    ),
  );

  useEffect(() => {
    if (api) {
      updateProfileState();
    }
  }, [api, activeAddress]);

  async function updateProfileState() {
    try {
      if (!api) {
        throw new Error('Arweave Wallet Kit not initialized');
      }
      const address = await api.getActiveAddress();
      setAddress(address);
      const signer = createDataItemSigner(window.arweaveWallet);
      setAoSigner(signer as AoSigner);
      await updateProfiles(address);
    } catch (error) {
      errorEmitter.emit('error', error);
    }
  }

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
