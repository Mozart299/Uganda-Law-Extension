console.log('background.js is running');

function sendNotification() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '48.png',
        title: 'Daily Ugandan Law Update',
        message: 'Check the latest updates on the Uganda constitution!',
        priority: 2
    }, function(notificationId) {
        console.log('Notification sent with ID:', notificationId);
    });
}

// // Schedule the notification to appear daily
// chrome.alarms.create('dailyLawUpdate', { periodInMinutes: 1440 }); // 1440 minutes = 1 day

// chrome.alarms.onAlarm.addListener((alarm) => {
//     if (alarm.name === 'dailyLawUpdate') {
//         sendNotification();
//     }
// });
