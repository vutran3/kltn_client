function Notification({ notifications }) {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">THÔNG BÁO</h3>
            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <div className="text-sm text-gray-600 text-center">Không có thông báo</div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`p-3 rounded-lg text-sm ${
                                n.type === "warning"
                                    ? "bg-red-100 border-l-4 border-red-500"
                                    : "bg-blue-100 border-l-4 border-blue-500"
                            }`}
                        >
                            <p className="font-medium">{n.message}</p>
                            <p className="text-gray-600 text-xs mt-1">{n.time}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Notification;
