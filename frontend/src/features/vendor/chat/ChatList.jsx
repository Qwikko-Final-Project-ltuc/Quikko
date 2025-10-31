// ChatList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatList({ vendorId }) {
  const [convs, setConvs] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetch(`/api/chats/vendor/${vendorId}/conversations`, { headers })
      .then(r => r.json())
      .then(d => setConvs(d.conversations || []));
  }, [vendorId]);

  return (
    <div>
      {convs.map(c => (
        <div key={c.customer_id}
             onClick={() => nav(`/vendor/chat/${c.customer_id}`)}
             className="p-3 cursor-pointer flex justify-between items-center">
          <div>
            <div className="font-bold">{c.customer_name}</div>
            <div className="text-sm text-gray-600 truncate">{c.last_message}</div>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <div>{new Date(c.last_at).toLocaleTimeString()}</div>
            {c.unread_count > 0 && <div className="bg-red-500 text-white rounded-full px-2">{c.unread_count}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
