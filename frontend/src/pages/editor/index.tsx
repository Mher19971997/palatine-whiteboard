import EditorContainer from "@palatine_whiteboard_frontend/components/EditorContainer";
import TopBar from "@palatine_whiteboard_frontend/components/TopBar";
import { EditorProvider } from "@palatine_whiteboard_frontend/editor/context";

export const EditorPage = () => {
    return (
        <EditorProvider>
            <div className="app">
                <TopBar />
                <div className="app-content">
                    <div className='sidebar' />
                    <EditorContainer />
                </div>
            </div>
        </EditorProvider>
    );
};