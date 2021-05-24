import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

import puppetsReducer from './reducers/puppets';

export const store = configureStore({
  reducer: {
    puppets: puppetsReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
