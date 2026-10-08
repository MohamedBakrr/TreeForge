import { configureStore } from '@reduxjs/toolkit'

const workspaceReducer = (state = {}) => state

export const store = configureStore({
    reducer: {
        workspace: workspaceReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
