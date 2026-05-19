import { serve } from "https://deno.land/std/http/server.ts";

// 🔹 HMAC-SHA256 서명 생성 (CoolSMS v4 인증용)
async function generateSignature(date: string, salt: string, apiSecret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(date + salt)
  );
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  // 🔹 CORS preflight 대응
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  try {
    const body = await req.json();
    
    // 🔹 Supabase Webhook 페이로드에서 데이터 추출 (insert 이벤트 기준)
    const record = body.record ?? body;

    // 🔔 '거제 센트레빌' 테이블 컬럼 매핑 (name, phone)
    const name = record.name ?? "이름없음";
    const phone = record.phone ?? "번호없음";
    
    // 현재 폼은 이름/연락처를 받고 있으므로, 알림 목적을 식별할 수 있는 유형 설정
    const typeKr = "관심고객 특별혜택 등록";

    // 🔹 환경변수 설정 확인
    const deno = (globalThis as any).Deno;
    const apiKey = deno.env.get("COOLSMS_API_KEY");
    const apiSecret = deno.env.get("COOLSMS_API_SECRET");
    
    // 🔹 발신/수신 번호 유지 (환경변수 또는 하드코딩 사용)
    const SEND_TO = deno.env.get("SMS_RECEIVER_PHONE") ?? "01072337413"; // 관리자 수신 번호
    const SEND_FROM = deno.env.get("SMS_SENDER_PHONE") ?? "01096460008"; // 발신자 번호 (CoolSMS 등록번호)

    if (!apiKey || !apiSecret) {
      throw new Error("COOLSMS API Key 또는 Secret이 설정되지 않았습니다.");
    }

    const date = new Date().toISOString();
    const salt = crypto.randomUUID();
    const signature = await generateSignature(date, salt, apiSecret);

    // 🔹 문자 메시지 본문 구성
    const smsText = `[거제 센트레빌] 신규문의\n` +
                  `------------------\n` +
                  `이름: ${name}\n` +
                  `연락처: ${phone}\n` +
                  `유형: ${typeKr}`;

    // 🔹 CoolSMS API 호출
    const smsRes = await fetch("https://api.coolsms.co.kr/messages/v4/send", {
      method: "POST",
      headers: {
        "Authorization": `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: {
          to: SEND_TO,
          from: SEND_FROM,
          text: smsText
        }
      })
    });

    const data = await smsRes.json();
    console.log("✅ [거제 센트레빌] SMS 발송 결과:", data);

    return new Response(JSON.stringify({
      ok: true,
      coolsms: data
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (err) {
    console.error("❌ Function Error:", err);
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : String(err)
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  }
});
