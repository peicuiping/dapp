'use client';

import { SnackbarKey, useSnackbar } from 'notistack';
import { useCallback, useEffect } from 'react';

import { NotificationContext } from './NotificationContext';
import { NotificationCTXDefaultValue } from './NotificationCTXDefaultValue';
import { SnackBarOpts } from './types';

let _notificationApi = {
  ...NotificationCTXDefaultValue,
};

export const NotificationStacked: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const addToQueue = useCallback(
    (opts: SnackBarOpts) => {
      const snackKey: SnackbarKey =
        opts.key || new Date().getTime() + Math.random();

      enqueueSnackbar(opts.message, {
        ...opts,
        key: snackKey,
      });
      return snackKey;
    },
    [enqueueSnackbar],
  );

  const remove = useCallback(
    (key: SnackbarKey) => closeSnackbar(key),
    [closeSnackbar],
  );

  useEffect(() => {
    _notificationApi = {
      addToQueue,
      remove,
    };
  }, [addToQueue, remove]);

  return (
    <NotificationContext.Provider
      value={{
        addToQueue,
        remove,
      }}
      children={children}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const notificationApi = (opts: Omit<SnackBarOpts, 'close'>) => {
  return _notificationApi.addToQueue(opts);
};

notificationApi.addToQueue = (
  opts: Omit<SnackBarOpts, 'close'>,
): SnackbarKey => {
  return _notificationApi.addToQueue(opts);
};

notificationApi.remove = (key: SnackbarKey): void => {
  return _notificationApi.remove(key);
};
