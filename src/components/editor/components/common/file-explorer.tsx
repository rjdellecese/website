import React, {
  createContext,
  useContext,
  useEffect,
  useReducer
} from "react"
import { Data } from "effect"
import {
  useWorkspaceHandle,
  useWorkspaceRef,
  useWorkspaceTree
} from "@/workspaces/context"
import { FileTree } from "./file-explorer/file-tree"
import { makeDirectory, Workspace } from "@/workspaces/domain/workspace"
import { RxRef } from "@effect-rx/rx-react"

export declare namespace FileExplorer {
  export type Reducer = React.Reducer<State, Action>

  export interface State {
    readonly creationMode: CreationMode
  }

  export type Dispatch = React.Dispatch<Action>

  export type Action = Data.TaggedEnum<{
    readonly ShowInput: {
      readonly type: InputType
      readonly path: string
    }
    readonly HideInput: {}
  }>

  export type InputType = "file" | "directory"

  export type CreationMode = Data.TaggedEnum<{
    Idle: {}
    CreatingFile: { readonly path: string }
    CreatingDirectory: { readonly path: string }
  }>
}

export const Action = Data.taggedEnum<FileExplorer.Action>()
export const CreationMode = Data.taggedEnum<FileExplorer.CreationMode>()

// See here for why we are using this pattern:
// https://react.dev/learn/scaling-up-with-reducer-and-context#combining-a-reducer-with-context
const StateContext = createContext<FileExplorer.State>(null as any)
const DispatchContext = createContext<FileExplorer.Dispatch>(null as any)

export const useExplorerState = () => useContext(StateContext)
export const useExplorerDispatch = () => useContext(DispatchContext)

function reducer(
  state: FileExplorer.State,
  action: FileExplorer.Action
): FileExplorer.State {
  switch (action._tag) {
    case "ShowInput": {
      const creationMode =
        action.type === "file"
          ? CreationMode.CreatingFile({ path: action.path })
          : CreationMode.CreatingDirectory({ path: action.path })
      return { ...state, creationMode }
    }
    case "HideInput": {
      return {
        ...state,
        creationMode: CreationMode.Idle()
      }
    }
  }
}

const initialState: FileExplorer.State = {
  creationMode: CreationMode.Idle()
}

export function FileExplorer() {
  const tree = useWorkspaceTree()
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <aside className="min-h-full w-full overflow-auto">
          <FileTree tree={tree} />
        </aside>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}
