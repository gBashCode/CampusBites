const formatWhatsAppJID = (phone) => {
    if (!phone) return null;
    
    // Strip all non-digit characters
    let digits = phone.replace(/\D/g, '');
    
    // If the user entered a standard 10-digit number, prefix with Indian country code (91) as default
    if (digits.length === 10) {
        digits = '91' + digits;
    } else if (digits.length === 11 && digits.startsWith('0')) {
        // Handle numbers starting with leading 0 (e.g. 09535847861 -> 919535847861)
        digits = '91' + digits.substring(1);
    }
    
    return `${digits}@c.us`;
};

const sendWhatsAppMessage = async (phone, text) => {
    const isEnabled = process.env.WHATSAPP_ENABLED === 'true';
    if (!isEnabled) {
        console.log('⚠️ WhatsApp notifications disabled. Skipping message.');
        return false;
    }

    const apiUrl = process.env.WHATSAPP_API_URL || 'http://localhost:2785/api';
    const apiKey = process.env.WHATSAPP_API_KEY;
    const sessionId = process.env.WHATSAPP_SESSION_ID || 'my-bot';

    const chatId = formatWhatsAppJID(phone);
    if (!chatId) {
        console.error('❌ Cannot send WhatsApp notification: Invalid phone number.');
        return false;
    }

    try {
        // Strip trailing slash if any from apiUrl
        const baseApi = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        const endpoint = `${baseApi}/sessions/${sessionId}/messages/send-text`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey || '',
                'Bypass-Tunnel-Reminder': 'true',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                chatId,
                text
            })
        });

        if (response.ok) {
            console.log(`✅ WhatsApp notification sent successfully to ${chatId}`);
            return true;
        } else {
            const errData = await response.json().catch(() => ({}));
            console.error(`❌ OpenWA Gateway returned status ${response.status}:`, errData);
            return false;
        }
    } catch (err) {
        console.error('❌ Error sending WhatsApp message via OpenWA Gateway:', err.message);
        return false;
    }
};

module.exports = {
    sendWhatsAppMessage,
    formatWhatsAppJID
};
