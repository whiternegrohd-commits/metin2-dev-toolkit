import React, { useState } from 'react';
import { Scroll, Save, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

const QUEST_TYPES = [
  { value: 'kill', label: 'Kill Quest', desc: 'Mob öldürme' },
  { value: 'delivery', label: 'Delivery Quest', desc: 'Eşya teslim' },
  { value: 'collection', label: 'Collection Quest', desc: 'Item toplama' },
  { value: 'level', label: 'Level Quest', desc: 'Seviye ulaşma' },
  { value: 'escort', label: 'Escort Quest', desc: 'NPC koruma' },
  { value: 'craft', label: 'Craft Quest', desc: 'Item üretme' },
  { value: 'explore', label: 'Explore Quest', desc: 'Bölge keşfetme' },
  { value: 'daily', label: 'Daily Quest', desc: 'Günlük görev' },
  { value: 'chain', label: 'Chain Quest', desc: 'Zincirleme görev' },
  { value: 'boss', label: 'Boss Quest', desc: 'Boss öldürme' },
];

function generateLua(form) {
  const q = form.name;
  const npc = form.npcVnum;
  const lvl = form.level;
  const yang = form.rewardYang;
  const exp = form.rewardExp;
  const rewardItem = form.rewardItemVnum ? `\t\t\t\tpc.give_item2(${form.rewardItemVnum}, ${form.rewardItemCount || 1})` : '';

  const header = `quest ${q} begin\n\tstate start begin`;
  const footer = `\tend\nend`;
  const levelCheck = `\t\t\tif pc.get_level() < ${lvl} then\n\t\t\t\tsay("Bu görevi almak için seviye ${lvl} olmalısın.")\n\t\t\t\treturn\n\t\t\tend`;
  const reward = `\t\t\t\tpc.give_exp(${exp})\n\t\t\t\tpc.give_gold(${yang})${rewardItem ? '\n' + rewardItem : ''}`;

  switch (form.type) {
    case 'kill':
      return `${header}
\t\twhen ${npc}.chat."${form.chatText || 'Görev Al'}" begin
${levelCheck}
\t\t\tif pc.count_quest_flag("${q}.done") >= 1 then
\t\t\t\tsay("Bu görevi zaten tamamladın.")
\t\t\t\treturn
\t\t\tend
\t\t\tsay("${form.killCount} adet ${form.mobName || 'mob'} öldür.")
\t\t\tset_quest_flag("${q}.kill_count", 0)
\t\t\tgoto kill_state
\t\tend
\tend

\tstate kill_state begin
\t\twhen kill with npc.get_vnum() == ${form.mobVnum} begin
\t\t\tlocal cnt = get_quest_flag("${q}.kill_count") + 1
\t\t\tset_quest_flag("${q}.kill_count", cnt)
\t\t\tnotice_log(string.format("${form.mobName || 'Mob'}: %d/${form.killCount}", cnt))
\t\t\tif cnt >= ${form.killCount} then
${reward}
\t\t\t\tset_quest_flag("${q}.done", 1)
\t\t\t\tsay("Görev tamamlandı! +${exp} EXP, +${yang} Yang")
\t\t\t\tgoto complete
\t\t\tend
\t\tend
\tend

\tstate complete begin
\t\twhen ${npc}.chat."Tamamlandı" begin
\t\t\tsay("Tebrikler!")
\t\tend
\t${footer}`;

    case 'delivery':
      return `${header}
\t\twhen ${npc}.chat."${form.chatText || 'Teslimat Görevi'}" begin
${levelCheck}
\t\t\tif pc.count_item(${form.itemVnum}) < ${form.itemCount} then
\t\t\t\tsay(string.format("${form.itemCount} adet eşya getir. (%d/${form.itemCount})", pc.count_item(${form.itemVnum})))
\t\t\t\treturn
\t\t\tend
\t\t\tpc.remove_item(${form.itemVnum}, ${form.itemCount})
${reward}
\t\t\tsay("Teşekkürler! +${exp} EXP, +${yang} Yang")
\t\tend
\t${footer}`;

    case 'collection':
      return `${header}
\t\twhen ${npc}.chat."${form.chatText || 'Toplama Görevi'}" begin
${levelCheck}
\t\t\tlocal cnt = pc.count_item(${form.itemVnum})
\t\t\tif cnt < ${form.itemCount} then
\t\t\t\tsay(string.format("${form.itemCount} adet item topla. (%d/${form.itemCount})", cnt))
\t\t\t\treturn
\t\t\tend
\t\t\tpc.remove_item(${form.itemVnum}, ${form.itemCount})
${reward}
\t\t\tsay("Harika! +${exp} EXP, +${yang} Yang")
\t\tend
\t${footer}`;

    case 'level':
      return `${header}
\t\twhen ${npc}.chat."${form.chatText || 'Seviye Görevi'}" begin
\t\t\tif pc.get_level() < ${form.targetLevel || lvl} then
\t\t\t\tsay(string.format("Seviye ${form.targetLevel || lvl} olman gerekiyor. (Şu an: %d)", pc.get_level()))
\t\t\t\treturn
\t\t\tend
${reward}
\t\t\tsay("Seviye ${form.targetLevel || lvl}'e ulaştın! +${exp} EXP, +${yang} Yang")
\t\tend
\t${footer}`;

    case 'escort':
      return `${header}
\t\twhen ${npc}.chat."${form.chatText || 'Koruma Görevi'}" begin
${levelCheck}
\t\t\tsay("Beni ${form.destName || 'hedefe'} kadar götür.")
\t\t\tset_quest_flag("${q}.escort", 1)
\t\tend
\tend

\tstate escort_state begin
\t\twhen ${form.destNpc || npc}.arrive begin
\t\t\tif get_quest_flag("${q}.escort") == 1 then
${reward}
\t\t\t\tset_quest_flag("${q}.escort", 0)
\t\t\t\tsay("Teşekkürler! +${exp} EXP, +${yang} Yang")
\t\t\tend
\t\tend
\t${footer}`;

    case 'craft':
      return `${header}
\t\twhen ${npc}.chat."${form.chatText || 'Üretim Görevi'}" begin
${levelCheck}
\t\t\tif pc.count_item(${form.itemVnum}) < ${form.itemCount} then
\t\t\t\tsay("${form.itemCount} adet item üret.")
\t\t\t\treturn
\t\t\tend
\t\t\tpc.remove_item(${form.itemVnum}, ${form.itemCount})
${reward}
\t\t\tsay("Üretim tamamlandı! +${exp} EXP, +${yang} Yang")
\t\tend
\t${footer}`;

    case 'explore':
      return `${header}
\t\twhen ${npc}.chat."${form.chatText || 'Keşif Görevi'}" begin
${levelCheck}
\t\t\tset_quest_flag("${q}.explore", 1)
\t\t\tsay("${form.destName || 'Bölgeyi'} keşfet ve geri dön.")
\t\tend
\tend

\tstate explore_state begin
\t\twhen enter.map.${form.mapIndex || 1} begin
\t\t\tif get_quest_flag("${q}.explore") == 1 then
\t\t\t\tset_quest_flag("${q}.explore", 2)
\t\t\t\tnotice_log("Bölge keşfedildi!")
\t\t\tend
\t\tend
\t\twhen ${npc}.chat."Tamamlandı" begin
\t\t\tif get_quest_flag("${q}.explore") == 2 then
${reward}
\t\t\t\tsay("Keşif tamamlandı! +${exp} EXP, +${yang} Yang")
\t\t\tend
\t\tend
\t${footer}`;

    case 'daily':
      return `${header}
\t\twhen ${npc}.chat."${form.chatText || 'Günlük Görev'}" begin
${levelCheck}
\t\t\tif get_quest_flag("${q}.last_day") == get_time() / 86400 then
\t\t\t\tsay("Bugünkü görevini zaten tamamladın. Yarın tekrar gel.")
\t\t\t\treturn
\t\t\tend
\t\t\tif pc.count_item(${form.itemVnum || 0}) < ${form.itemCount || 1} then
\t\t\t\tsay("${form.itemCount || 1} adet item getir.")
\t\t\t\treturn
\t\t\tend
\t\t\tpc.remove_item(${form.itemVnum || 0}, ${form.itemCount || 1})
\t\t\tset_quest_flag("${q}.last_day", get_time() / 86400)
${reward}
\t\t\tsay("Günlük görev tamamlandı! +${exp} EXP, +${yang} Yang")
\t\tend
\t${footer}`;

    case 'chain':
      return `${header}
\t\twhen ${npc}.chat."${form.chatText || 'Görev Al'}" begin
${levelCheck}
\t\t\tlocal step = get_quest_flag("${q}.step")
\t\t\tif step == 0 then
\t\t\t\tsay("Adım 1: ${form.killCount} mob öldür.")
\t\t\t\tset_quest_flag("${q}.step", 1)
\t\t\t\tset_quest_flag("${q}.kill_count", 0)
\t\t\telseif step == 2 then
\t\t\t\tif pc.count_item(${form.itemVnum || 0}) < ${form.itemCount || 1} then
\t\t\t\t\tsay("Adım 2: ${form.itemCount || 1} item getir.")
\t\t\t\t\treturn
\t\t\t\tend
\t\t\t\tpc.remove_item(${form.itemVnum || 0}, ${form.itemCount || 1})
${reward}
\t\t\t\tset_quest_flag("${q}.step", 3)
\t\t\t\tsay("Zincirleme görev tamamlandı!")
\t\t\tend
\t\tend
\tend

\tstate chain_kill begin
\t\twhen kill with npc.get_vnum() == ${form.mobVnum} begin
\t\t\tif get_quest_flag("${q}.step") == 1 then
\t\t\t\tlocal cnt = get_quest_flag("${q}.kill_count") + 1
\t\t\t\tset_quest_flag("${q}.kill_count", cnt)
\t\t\t\tif cnt >= ${form.killCount} then
\t\t\t\t\tset_quest_flag("${q}.step", 2)
\t\t\t\t\tnotice_log("Adım 1 tamamlandı! NPC'ye dön.")
\t\t\t\tend
\t\t\tend
\t\tend
\t${footer}`;

    case 'boss':
      return `${header}
\t\twhen ${npc}.chat."${form.chatText || 'Boss Görevi'}" begin
${levelCheck}
\t\t\tif get_quest_flag("${q}.done") >= 1 then
\t\t\t\tsay("Bu görevi zaten tamamladın.")
\t\t\t\treturn
\t\t\tend
\t\t\tsay("Boss #${form.mobVnum} öldür ve geri dön.")
\t\t\tset_quest_flag("${q}.boss_killed", 0)
\t\tend
\tend

\tstate boss_hunt begin
\t\twhen kill with npc.get_vnum() == ${form.mobVnum} begin
\t\t\tset_quest_flag("${q}.boss_killed", 1)
\t\t\tnotice_log("Boss öldürüldü! NPC'ye dön.")
\t\tend
\t\twhen ${npc}.chat."Teslim Et" begin
\t\t\tif get_quest_flag("${q}.boss_killed") == 1 then
${reward}
\t\t\t\tset_quest_flag("${q}.done", 1)
\t\t\t\tsay("Boss öldürüldü! +${exp} EXP, +${yang} Yang")
\t\t\tend
\t\tend
\t${footer}`;

    default:
      return `quest ${q} begin\n\tstate start begin\n\t\t-- Quest kodu buraya\n\tend\nend`;
  }
}

function QuestGenerator() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: 'my_quest', level: 1, npcVnum: 20000, type: 'kill',
    mobVnum: 101, mobName: 'Canavar', killCount: 10,
    rewardYang: 10000, rewardExp: 5000,
    itemVnum: 27001, itemCount: 5,
    rewardItemVnum: '', rewardItemCount: 1,
    chatText: '', targetLevel: 30,
    destName: 'Hedef', destNpc: 20001, mapIndex: 1
  });
  const [luaCode, setLuaCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(null);

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const inputClass = "w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm";
  const labelClass = "block text-xs font-medium text-text-muted mb-1";

  const copyCode = () => { navigator.clipboard.writeText(luaCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const saveLua = async () => {
    if (!luaCode) return;
    if (!ipcRenderer) { setStatus({ ok: false, msg: 'Electron gerekli' }); return; }
    const path = await ipcRenderer.invoke('save-file-dialog', [{ name: 'Lua Quest', extensions: ['lua'] }], `${form.name}.lua`);
    if (!path) return;
    const result = await ipcRenderer.invoke('write-file', path, luaCode);
    setStatus({ ok: result.success, msg: result.success ? `Kaydedildi: ${path}` : result.error });
    setTimeout(() => setStatus(null), 3000);
  };

  const selectedType = QUEST_TYPES.find(q => q.value === form.type);

  // Türe göre ek alanlar
  const renderExtraFields = () => {
    const killFields = (
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>{t('mob_vnum')}</label><input type="number" className={inputClass} value={form.mobVnum} onChange={e => f('mobVnum', parseInt(e.target.value))} /></div>
        <div><label className={labelClass}>Mob Adı</label><input type="text" className={inputClass} value={form.mobName} onChange={e => f('mobName', e.target.value)} /></div>
        <div className="col-span-2"><label className={labelClass}>{t('kill_count')}</label><input type="number" className={inputClass} value={form.killCount} onChange={e => f('killCount', parseInt(e.target.value))} /></div>
      </div>
    );
    const itemFields = (
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Item VNum</label><input type="number" className={inputClass} value={form.itemVnum} onChange={e => f('itemVnum', parseInt(e.target.value))} /></div>
        <div><label className={labelClass}>Adet</label><input type="number" className={inputClass} value={form.itemCount} onChange={e => f('itemCount', parseInt(e.target.value))} /></div>
      </div>
    );
    switch (form.type) {
      case 'kill': case 'boss': return killFields;
      case 'chain': return <>{killFields}{itemFields}</>;
      case 'delivery': case 'collection': case 'craft': case 'daily': return itemFields;
      case 'level': return <div><label className={labelClass}>Hedef Seviye</label><input type="number" className={inputClass} value={form.targetLevel} onChange={e => f('targetLevel', parseInt(e.target.value))} /></div>;
      case 'escort': return (
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Hedef Adı</label><input type="text" className={inputClass} value={form.destName} onChange={e => f('destName', e.target.value)} /></div>
          <div><label className={labelClass}>Hedef NPC VNum</label><input type="number" className={inputClass} value={form.destNpc} onChange={e => f('destNpc', parseInt(e.target.value))} /></div>
        </div>
      );
      case 'explore': return (
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Harita Adı</label><input type="text" className={inputClass} value={form.destName} onChange={e => f('destName', e.target.value)} /></div>
          <div><label className={labelClass}>Map Index</label><input type="number" className={inputClass} value={form.mapIndex} onChange={e => f('mapIndex', parseInt(e.target.value))} /></div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="h-full flex space-x-4">
      {/* Sol: Form */}
      <div className="w-80 bg-dark-surface rounded-xl border border-dark-border p-5 flex flex-col space-y-3 overflow-auto">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-cyber-green/10 rounded-lg border border-cyber-green/20">
            <Scroll className="w-5 h-5 text-cyber-green" />
          </div>
          <h1 className="text-base font-semibold text-text-primary">{t('quest_gen_title')}</h1>
        </div>

        <div><label className={labelClass}>{t('quest_name')}</label><input type="text" className={inputClass} value={form.name} onChange={e => f('name', e.target.value)} /></div>
        <div><label className={labelClass}>Chat Metni</label><input type="text" className={inputClass} value={form.chatText} onChange={e => f('chatText', e.target.value)} placeholder="Görev Al" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>{t('quest_level')}</label><input type="number" className={inputClass} value={form.level} onChange={e => f('level', parseInt(e.target.value))} /></div>
          <div><label className={labelClass}>{t('quest_npc')}</label><input type="number" className={inputClass} value={form.npcVnum} onChange={e => f('npcVnum', parseInt(e.target.value))} /></div>
        </div>

        {/* Quest type grid */}
        <div>
          <label className={labelClass}>{t('quest_type')}</label>
          <div className="grid grid-cols-2 gap-1.5">
            {QUEST_TYPES.map(qt => (
              <button key={qt.value} onClick={() => f('type', qt.value)}
                className={`px-2 py-2 rounded-lg text-xs border transition-colors text-left ${
                  form.type === qt.value
                    ? 'border-cyber-green bg-cyber-green/10 text-cyber-green'
                    : 'border-dark-border bg-dark-hover text-text-muted hover:text-text-primary hover:border-cyber-green/30'
                }`}>
                <div className="font-medium">{qt.label}</div>
                <div className="text-text-muted text-xs">{qt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {renderExtraFields()}

        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>{t('reward_yang')}</label><input type="number" className={inputClass} value={form.rewardYang} onChange={e => f('rewardYang', parseInt(e.target.value))} /></div>
          <div><label className={labelClass}>{t('reward_exp')}</label><input type="number" className={inputClass} value={form.rewardExp} onChange={e => f('rewardExp', parseInt(e.target.value))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Ödül Item VNum</label><input type="number" className={inputClass} value={form.rewardItemVnum} onChange={e => f('rewardItemVnum', e.target.value)} placeholder="0 = yok" /></div>
          <div><label className={labelClass}>Ödül Adet</label><input type="number" className={inputClass} value={form.rewardItemCount} onChange={e => f('rewardItemCount', parseInt(e.target.value))} /></div>
        </div>

        <button onClick={() => setLuaCode(generateLua(form))}
          className="w-full py-2.5 bg-cyber-green hover:bg-cyber-green/80 rounded-lg text-dark-bg font-medium text-sm transition-colors">
          {t('generate_lua')}
        </button>
      </div>

      {/* Sağ: Kod */}
      <div className="flex-1 bg-dark-surface rounded-xl border border-dark-border p-5 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Lua Output</h2>
            {selectedType && <p className="text-xs text-text-muted">{selectedType.label} — {selectedType.desc}</p>}
          </div>
          {luaCode && (
            <div className="flex items-center space-x-2">
              <button onClick={copyCode}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-dark-hover border border-dark-border rounded-lg text-text-primary text-xs transition-colors hover:bg-dark-border">
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? t('copied') : t('copy_code')}</span>
              </button>
              <button onClick={saveLua}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 rounded-lg text-cyber-green text-xs transition-colors">
                <Save className="w-3.5 h-3.5" />
                <span>{t('save_lua')}</span>
              </button>
            </div>
          )}
        </div>
        {status && (
          <div className={`flex items-center space-x-2 p-2.5 rounded-lg border mb-3 text-sm ${status.ok ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'}`}>
            {status.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{status.msg}</span>
          </div>
        )}
        <div className="flex-1 bg-dark-bg rounded-lg border border-dark-border overflow-auto">
          {luaCode ? (
            <pre className="p-4 text-xs font-mono text-text-primary leading-relaxed whitespace-pre">{luaCode}</pre>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Scroll className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted text-sm">Quest türünü seç ve "{t('generate_lua')}" butonuna bas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestGenerator;
