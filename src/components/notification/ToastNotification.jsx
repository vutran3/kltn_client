import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ToastNotification({ notif, onClose }) {
  return (
    <div className="pointer-events-auto w-[360px] rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              {/* icon đơn giản */}
              <span className="text-red-600 text-sm">⚠️</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="font-medium leading-tight line-clamp-1">
                {notif?.title || 'Thông báo'}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-1 text-sm text-slate-600 line-clamp-2">
              {notif?.body}
            </div>
          </div>
        </div>

        {notif?.imageUrl && (
          <img
            src={notif.imageUrl}
            alt=""
            className="mt-3 h-28 w-full rounded-lg object-cover border"
          />
        )}
      </div>
    </div>
  );
}
