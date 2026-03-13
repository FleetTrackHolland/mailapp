import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function EmailSettings() {
  const { t } = useLanguage();
  const { appConfig, updateAppConfig } = useApp();
  
  const [useSsl, setUseSsl] = useState(appConfig.smtpSsl ?? true);
  const [spamThrottle, setSpamThrottle] = useState(appConfig.spamThrottle ?? true);
  const [sigHtml, setSigHtml] = useState(appConfig.emailSignature || 
    `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#374151;">
      <tr><td style="padding-bottom:4px;"><strong style="font-size:14px;color:#111827;">John Doe</strong></td></tr>
      <tr><td style="color:#6B7280;">Sales Director &bull; ${appConfig.companyName}</td></tr>
      <tr><td style="padding-top:4px;"><a href="https://${appConfig.website}" style="color:#007AFF;text-decoration:none;">${appConfig.website}</a> &nbsp;|&nbsp; <a href="tel:${appConfig.phone}" style="color:#007AFF;text-decoration:none;">${appConfig.phone}</a></td></tr>
    </table>`
  );

  const [smtpConfig, setSmtpConfig] = useState({
    senderName: appConfig.senderName || `${appConfig.companyName} Sales`,
    host: appConfig.smtpHost || 'smtp.office365.com',
    port: appConfig.smtpPort || '587 (Standard)',
    username: appConfig.smtpUsername || `noreply@${appConfig.website.replace('www.', '')}`,
    password: appConfig.smtpPassword || '••••••••',
    replyTo: appConfig.replyToEmail || `hello@${appConfig.website.replace('www.', '')}`
  });

  const sigRef = useRef(null);

  React.useEffect(() => {
    if (sigRef.current) {
      sigRef.current.innerHTML = sigHtml;
    }
  }, []);

  const domain = appConfig.website.replace('www.', '');

  const Toggle = ({ value, onChange }) => (
    <div 
      onClick={onChange} 
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${value ? 'bg-tesla-blue' : 'bg-tesla-elevated'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  );

  const inputCls = 'block w-full rounded-tesla border border-tesla-border bg-tesla-surface py-2.5 px-4 text-white placeholder-tesla-muted text-[11px] font-black uppercase tracking-wider focus:border-tesla-blue focus:ring-0 transition-all';
  const handleSave = async () => {
    await updateAppConfig({
      ...smtpConfig,
      smtpSsl: useSsl,
      spamThrottle: spamThrottle,
      emailSignature: sigHtml
    });
    alert(t('saveChanges') + '!');
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-12 animate-in fade-in duration-700">
      <div className="mb-8 px-4">
        <h2 className="text-3xl font-light text-tesla-text tracking-tight uppercase">{t('tabEmailNav')}</h2>
        <p className="text-[13px] font-light text-tesla-muted mt-2">{t('emailConfigDesc') || 'Configureer uw uitgaande e-mailserver en e-mailhandtekening.'}</p>
      </div>

      <div className="bg-tesla-surface rounded-2xl shadow-soft border border-tesla-border overflow-auto p-10 space-y-16">
        <div>
          <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest mb-10">{t('emailConfig')}</h3>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-10 max-w-4xl mb-12">
            <div className="sm:col-span-2"><label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-2 pl-1">{t('senderName')}</label><input type="text" value={smtpConfig.senderName} onChange={e => setSmtpConfig({...smtpConfig, senderName: e.target.value})} className={inputCls} /></div>
            <div><label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-2 pl-1">{t('smtpHost')}</label><input type="text" value={smtpConfig.host} onChange={e => setSmtpConfig({...smtpConfig, host: e.target.value})} className={inputCls} /></div>
            <div><label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-2 pl-1">{t('smtpPort')}</label>
              <select className={inputCls} value={smtpConfig.port} onChange={e => setSmtpConfig({...smtpConfig, port: e.target.value})}><option>587 (Standard)</option><option>465 (SSL)</option><option>25 (Unencrypted)</option></select>
            </div>
            <div><label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-2 pl-1">SMTP Gebruikersnaam</label><input type="text" value={smtpConfig.username} onChange={e => setSmtpConfig({...smtpConfig, username: e.target.value})} className={inputCls} /></div>
            <div><label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-2 pl-1">SMTP Wachtwoord</label><input type="password" value={smtpConfig.password} onChange={e => setSmtpConfig({...smtpConfig, password: e.target.value})} className={inputCls} /></div>
            <div className="sm:col-span-2"><label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-2 pl-1">{t('replyToEmail')}</label><input type="email" value={smtpConfig.replyTo} onChange={e => setSmtpConfig({...smtpConfig, replyTo: e.target.value})} className={inputCls} /></div>
            <div className="sm:col-span-2 pt-6 border-t border-tesla-border flex items-center justify-between">
              <div><span className="block text-[12px] font-normal text-tesla-text uppercase tracking-widest">{t('useSslTls')}</span><span className="block text-[10px] font-light text-tesla-muted mt-1">Versleutel alle SMTP-verbindingen met TLS</span></div>
              <Toggle value={useSsl} onChange={() => setUseSsl(p => !p)} />
            </div>
            <div className="sm:col-span-2 pt-6 border-t border-tesla-border flex items-center justify-between">
              <div><span className="block text-[12px] font-normal text-tesla-text uppercase tracking-widest">{t('spamPrevention')}</span><span className="block text-[10px] font-light text-tesla-muted mt-1 uppercase tracking-widest">{t('dailyLimit')}: <strong className="text-tesla-text">500 e-mails/dag</strong></span></div>
              <Toggle value={spamThrottle} onChange={() => setSpamThrottle(p => !p)} />
            </div>
          </div>

          <div className="pt-10 border-t border-tesla-border">
            <label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-5 pl-1">{t('defaultSignature')}</label>
            
            <div className="rounded-2xl border border-tesla-border overflow-hidden bg-white shadow-soft">
              <div className="flex flex-wrap items-center gap-1.5 px-4 py-3 bg-tesla-elevated border-b border-tesla-border">
                {[
                  { cmd: 'bold', icon: 'B', title: 'Bold', cls: 'font-black' },
                  { cmd: 'italic', icon: 'I', title: 'Italic', cls: 'italic' },
                  { cmd: 'underline', icon: 'U', title: 'Underline', cls: 'underline' },
                ].map(btn => (
                  <button key={btn.cmd} title={btn.title} type="button"
                    onMouseDown={e => { e.preventDefault(); document.execCommand(btn.cmd, false, null); sigRef.current?.focus(); }}
                    className={`w-8 h-8 rounded-sm text-[11px] font-black ${btn.cls} text-tesla-muted hover:bg-tesla-elevated hover:text-white transition-all`}>{btn.icon}</button>
                ))}
                <div className="w-px h-6 bg-tesla-border mx-2" />
                {[
                  { cmd: 'justifyLeft', icon: '≡', title: 'Align Left' },
                  { cmd: 'justifyCenter', icon: '≡', title: 'Align Center' },
                ].map(btn => (
                  <button key={btn.cmd} title={btn.title} type="button"
                    onMouseDown={e => { e.preventDefault(); document.execCommand(btn.cmd, false, null); }}
                    className="w-8 h-8 rounded-sm text-[11px] font-black text-tesla-muted hover:bg-tesla-elevated hover:text-white transition-all">{btn.icon}</button>
                ))}
                <div className="w-px h-6 bg-tesla-border mx-2" />
                <span className="text-[9px] text-tesla-muted uppercase tracking-superwide font-black mr-2">Palette</span>
                {['#FFFFFF','#E31937','#3D6AE1','#8E8E93','#222222'].map(color => (
                  <button key={color} title={color} type="button"
                    onMouseDown={e => { e.preventDefault(); document.execCommand('foreColor', false, color); sigRef.current?.focus(); }}
                    className="w-5 h-5 rounded-full border border-tesla-border hover:scale-125 transition-all shadow-lg"
                    style={{ backgroundColor: color }} />
                ))}
                <div className="w-px h-6 bg-tesla-border mx-2" />
                <button title="Insert Link" type="button"
                  onMouseDown={e => { e.preventDefault(); const url = prompt('Enter URL:', 'https://'); if (url) document.execCommand('createLink', false, url); sigRef.current?.focus(); }}
                  className="w-8 h-8 rounded-sm text-[11px] font-black text-tesla-blue hover:bg-tesla-blue/10 transition-all border border-transparent hover:border-tesla-blue/20">LK</button>
                <button title="Clear Formatting" type="button"
                  onMouseDown={e => { e.preventDefault(); document.execCommand('removeFormat', false, null); sigRef.current?.focus(); }}
                  className="ml-auto text-[9px] font-normal text-tesla-muted hover:text-white px-3 py-1.5 rounded-lg hover:bg-tesla-blue transition-all uppercase tracking-widest">Reset</button>
              </div>

              <div
                ref={sigRef}
                contentEditable
                suppressContentEditableWarning
                onInput={e => setSigHtml(e.currentTarget.innerHTML)}
                className="min-h-[160px] p-8 text-[13px] text-tesla-text focus:outline-none bg-white selection:bg-tesla-blue/20"
              />

              <div className="px-5 py-2.5 bg-tesla-elevated border-t border-tesla-border flex items-center justify-between">
                <span className="text-[9px] text-tesla-muted uppercase tracking-widest font-normal">Design Preview Engine</span>
              </div>
              <div className="p-10 bg-white border-t border-tesla-border overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: sigHtml }} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-10 border-t border-tesla-border">
          <button onClick={handleSave} className="rounded-full bg-tesla-text px-12 py-3.5 text-[11px] font-normal text-tesla-bg shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all uppercase tracking-widest">
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
