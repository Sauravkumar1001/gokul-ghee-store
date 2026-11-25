import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';

const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateLocalCaptcha() {
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * CAPTCHA_CHARS.length);
    code += CAPTCHA_CHARS[randomIndex];
  }

  const width = 160;
  const height = 48;

  const lines = Array.from({ length: 4 })
    .map(() => {
      const x1 = Math.floor(Math.random() * width);
      const y1 = Math.floor(Math.random() * height);
      const x2 = Math.floor(Math.random() * width);
      const y2 = Math.floor(Math.random() * height);
      const colors = ['#D4A373', '#2D6A4F', '#8C6D46', '#1B4332'];
      const stroke = colors[Math.floor(Math.random() * colors.length)];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.5" stroke-opacity="0.45" />`;
    })
    .join('');

  const charSpacing = width / (code.length + 1);
  const textElements = code
    .split('')
    .map((char, index) => {
      const x = Math.floor(charSpacing * (index + 0.65));
      const y = Math.floor(30 + (Math.random() * 6 - 3));
      const rotate = Math.floor(Math.random() * 24 - 12);
      const colors = ['#0F3D2E', '#1B4332', '#704214', '#2D6A4F'];
      const fill = colors[Math.floor(Math.random() * colors.length)];
      return `<text x="${x}" y="${y}" font-family="Verdana, Arial, sans-serif" font-size="22" font-weight="700" fill="${fill}" transform="rotate(${rotate}, ${x}, ${y})">${char}</text>`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #F8F5EE; border-radius: 8px; border: 1px solid #E2D9C8; user-select: none;">${lines}${textElements}</svg>`;
  const token = 'local:' + btoa(code);

  return { token, svg };
}

export default function CaptchaWidget({
  onChange,
  resetTrigger = 0,
  error = '',
}) {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const isHinglish = language === 'hinglish';

  // Immediately initialize with a local visual captcha so it NEVER hangs on "Loading..."
  const [captchaData, setCaptchaData] = useState(() => generateLocalCaptcha());
  const [answer, setAnswer] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stable ref for onChange to completely prevent re-render cascading loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Inform parent of the initial valid captcha token on mount
  useEffect(() => {
    if (onChangeRef.current) {
      onChangeRef.current({ captchaToken: captchaData.token, captchaAnswer: '' });
    }
  }, [captchaData.token]);

  const refreshCaptcha = useCallback(async () => {
    setIsRefreshing(true);
    setAnswer('');

    // Try fetching a server token first
    try {
      const res = await authService.getCaptcha();
      if (res.ok && res.data?.captchaToken && res.data?.captchaSvg) {
        setCaptchaData({
          token: res.data.captchaToken,
          svg: res.data.captchaSvg,
        });
        if (onChangeRef.current) {
          onChangeRef.current({ captchaToken: res.data.captchaToken, captchaAnswer: '' });
        }
        setIsRefreshing(false);
        return;
      }
    } catch {
      // Fallback cleanly to local generation
    }

    // Instant local fallback
    const local = generateLocalCaptcha();
    setCaptchaData(local);
    if (onChangeRef.current) {
      onChangeRef.current({ captchaToken: local.token, captchaAnswer: '' });
    }
    setIsRefreshing(false);
  }, []);

  // Reload when parent triggers a reset (e.g. after invalid submission)
  useEffect(() => {
    if (resetTrigger > 0) {
      refreshCaptcha();
    }
  }, [resetTrigger, refreshCaptcha]);

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    setAnswer(val);
    if (onChangeRef.current) {
      onChangeRef.current({
        captchaToken: captchaData.token,
        captchaAnswer: val,
      });
    }
  };

  return (
    <div className="space-y-2 pt-1 pb-1">
      <div className="flex items-center justify-between text-xs font-medium text-[#0F3D2E]">
        <span className="flex items-center gap-1.5 font-semibold text-[#1B4332]">
          <ShieldCheck className="w-4 h-4 text-[#C98A2C]" />
          {isHi
            ? 'सुरक्षा कोड (Security Check)'
            : isHinglish
              ? 'Security Code Daalein'
              : 'Security Verification'}
        </span>
        <button
          type="button"
          onClick={refreshCaptcha}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1 text-[11px] text-[#8C6D46] hover:text-[#0F3D2E] transition-colors cursor-pointer disabled:opacity-50"
          title={isHi ? 'नया कोड लोड करें' : 'Get a new code'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isHi ? 'नया कोड' : 'Refresh'}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* SVG Display Card */}
        <div className="relative flex-shrink-0 flex items-center justify-center min-w-[160px] h-[48px] bg-[#F8F5EE] border border-[#E2D9C8] rounded-xl overflow-hidden shadow-inner">
          <div
            className="w-full h-full flex items-center justify-center select-none"
            dangerouslySetInnerHTML={{ __html: captchaData.svg }}
          />
        </div>

        {/* User Answer Input Field */}
        <div className="flex-1">
          <input
            type="text"
            value={answer}
            onChange={handleInputChange}
            maxLength={5}
            autoComplete="off"
            placeholder={
              isHi
                ? 'ऊपर दिया कोड लिखें'
                : isHinglish
                  ? 'Code enter karein'
                  : 'ENTER 5-CHAR CODE'
            }
            className="w-full h-[48px] px-3.5 bg-white border border-[#D5C7B5] rounded-xl text-center sm:text-left text-base font-bold tracking-widest text-[#0F3D2E] uppercase placeholder:text-xs placeholder:tracking-normal placeholder:font-normal placeholder:text-[#A89885] focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#B91C1C] font-medium animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
}
