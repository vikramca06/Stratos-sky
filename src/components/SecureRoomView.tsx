import React, { useState } from 'react';
import { Shield, Lock, Plus, Users, FileText } from 'lucide-react';

export const SecureRoomView: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);

  const createRoom = () => {
    const name = window.prompt('Enter secure room name:');
    if (name) {
      // Create secure room logic
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="text-green-600" />
          Secure Rooms
        </h2>
        <button
          onClick={createRoom}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
          <Lock size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No secure rooms</p>
          <p className="text-sm text-gray-400 mt-2">Create a secure room for sensitive documents</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <Shield className="text-green-600" size={32} />
                {room.watermarkEnabled && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Watermarked</span>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">{room.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{room.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  {room.members?.length || 0} members
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={16} />
                  {room.files?.length || 0} files
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};