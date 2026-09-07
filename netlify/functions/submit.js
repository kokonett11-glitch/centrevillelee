import crypto from 'crypto';

export async function handler(event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'ok' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { name, phone, visit_date, visit_time, agreement, agreed_to_privacy } = data;

    if (!name || !phone) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: '성함과 연락처는 필수 항목입니다.' }),
      };
    }

    const isAgreed = (agreed_to_privacy !== undefined ? agreed_to_privacy : agreement) ? 1 : 0;
    const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    // 1. Save directly into Cloudflare D1 database "google_ads" -> "거제 센트레빌 이대진" table
    let d1Success = false;
    let d1Result = null;
    try {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || 'bd7cf251b5ebb545c87bdf8f028f50c8';
      const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID || '3c64dd97-b38a-4660-98a4-a542df12d8c7';
      let token = process.env.CLOUDFLARE_D1_TOKEN || 'cfoat_Y_3Vyqn_8PCAZWORppdMcVZrTypegRW-l5CIKnIpi48.x0ogjnLeJwHVkGMcsxj_XTBeOTr7N8rJ0zl9lIHaICc';

      const insertSql = 'INSERT INTO "거제 센트레빌 이대진" (name, phone, agreed_to_privacy, source, created_at, visit_date, visit_time) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const insertParams = [
        name,
        phone,
        isAgreed,
        'google_ads_landing',
        kstNow,
        visit_date || null,
        visit_time || null
      ];

      async function runD1Query(authToken) {
        const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sql: insertSql, params: insertParams })
        });
        return res.json();
      }

      d1Result = await runD1Query(token);

      // If token expired, auto-refresh via OAuth refresh token and retry
      if (!d1Result.success && d1Result.errors?.[0]?.code === 10000) {
        console.log('🔄 Cloudflare D1 token expired, auto-refreshing...');
        const refreshToken = process.env.CLOUDFLARE_REFRESH_TOKEN || 'cfort_9kUDlpoM_0abaKN3fltBqDYxh9hUkOIKNDfdTv65lqY.OJMAWDOLeWG-v38oSCtzR0nY24WZrUyonZH8dMv_oFE';
        const refreshRes = await fetch('https://dash.cloudflare.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: '54d11594-84e4-41aa-b438-e81b8fa78ee7',
            refresh_token: refreshToken
          })
        });
        const refreshData = await refreshRes.json();
        if (refreshData.access_token) {
          token = refreshData.access_token;
          d1Result = await runD1Query(token);
        }
      }

      if (d1Result.success) d1Success = true;
      console.log('✅ [D1 Insert Result]:', JSON.stringify(d1Result));
    } catch (d1Err) {
      console.error('❌ [D1 Insert Error]:', d1Err);
    }

    // 2. CoolSMS SMS Sending Logic to 이대진 담당자 (010-7233-7413)
    let smsResult = null;
    try {
      const apiKey = process.env.COOLSMS_API_KEY || 'NCS2SNXZHU7UTDFN';
      const apiSecret = process.env.COOLSMS_API_SECRET || 'BYYG3XVYP7J53E8CDBZ2AFBV3STEW67L';
      const sendTo = process.env.SMS_RECEIVER_PHONE || '01072337413';
      const sendFrom = process.env.SMS_SENDER_PHONE || '01096460008';

      const date = new Date().toISOString();
      const salt = crypto.randomBytes(16).toString('hex');
      const messageStr = date + salt;

      const signature = crypto.createHmac('sha256', apiSecret).update(messageStr).digest('hex');
      const authHeader = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;

      const textMessage = `[거제 센트레빌] 신규문의\n------------------\n이름: ${name}\n연락처: ${phone}\n방문일: ${visit_date || '미지정'}\n방문시간: ${visit_time || '미지정'}\n유형: 관심고객 특별혜택 및 방문예약`;

      const smsRes = await fetch('https://api.coolsms.co.kr/messages/v4/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          message: {
            to: sendTo,
            from: sendFrom,
            text: textMessage,
          },
        }),
      });

      smsResult = await smsRes.json();
      console.log('✅ [CoolSMS Send Result]:', smsResult);
    } catch (smsErr) {
      console.error('❌ [CoolSMS Send Error]:', smsErr);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
      body: JSON.stringify({
        success: true,
        message: '접수가 성공적으로 완료되었습니다.',
        d1: d1Success,
        sms: smsResult
      }),
    };
  } catch (err) {
    console.error('Netlify Function error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || '서버 오류가 발생했습니다.' }),
    };
  }
}
