
import Inbox from "../components/Inbox";
import Conversation from "../components/Conversation";
const ChatPage = () => {
  return (
    <div className="flex" style={{ height: "calc(100vh - 72px)" }}>
      <div className="w-1/3 border-r h-full overflow-y-auto">
        <Inbox />
      </div>
      <div className="flex-1 flex flex-col h-full">
        <Conversation />
      </div>
    </div>
  );
};


export default ChatPage;
