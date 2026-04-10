import React, { useState } from 'react';
import { Copy, Download, Plus, Trash2, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

function QuestGenerator({ config }) {
  const { t } = useLanguage();
  const [questType, setQuestType] = useState('kill');
  const [questData, setQuestData] = useState({
    name: 'Örnek Quest',
    npcVnum: 20001,
    level: 1,
    targets: [{ mobVnum: 1001, count: 10 }],
    rewards: {
      exp: 1000,
      gold: 5000,
      item: ''
    }
  });
  const [generatedCode, setGeneratedCode] = useState('');

  const questTypes = [
    { value: 'kill', label: 'Kill Quest', icon: '⚔️' },
    { value: 'delivery', label: 'Delivery Quest', icon: '📦' },
    { value: 'collection', label: 'Collection Quest', icon: '🎁' },
    { value: 'escort', label: 'Escort Quest', icon: '🚶' }
  ];

  const generateLuaCode = () => {
    let code = '';

    if (questType === 'kill') {
      code = `quest ${questData.name} begin
    state start begin
        when login begin
            send_letter("${questData.name}")
        end
        
        when ${questData.npcVnum}.chat."${questData.name}" begin
            say_title("${questData.name}")
            say("")
            say("${questData.targets[0]?.count || 10}개의 몬스터를 처치해주세요.")
            set_quest_flag("${questData.name}", 1)
        end
        
        when kill begin
            if get_quest_flag("${questData.name}") == 1 then
                local count = get_quest_flag("${questData.name}_count") or 0
                count = count + 1
                set_quest_flag("${questData.name}_count", count)
                
                if count >= ${questData.targets[0]?.count || 10} then
                    send_letter("${questData.name} 완료!")
                    set_quest_flag("${questData.name}", 2)
                end
            end
        end
        
        when ${questData.npcVnum}.chat."보상받기" begin
            if get_quest_flag("${questData.name}") == 2 then
                say_title("${questData.name}")
                say("축하합니다!")
                give_exp(${questData.rewards.exp})
                give_gold(${questData.rewards.gold})
                ${questData.rewards.item ? `give_item(${questData.rewards.item}, 1)` : ''}
                set_quest_flag("${questData.name}", 0)
                set_quest_flag("${questData.name}_count", 0)
            end
        end
    end
end`;
    } else if (questType === 'delivery') {
      code = `quest ${questData.name} begin
    state start begin
        when login begin
            send_letter("${questData.name}")
        end
        
        when ${questData.npcVnum}.chat."${questData.name}" begin
            say_title("${questData.name}")
            say("물품을 배달해주세요.")
            give_item(${questData.rewards.item || 1}, 1)
            set_quest_flag("${questData.name}", 1)
        end
        
        when ${questData.npcVnum}.chat."배달완료" begin
            if has_item(${questData.rewards.item || 1}) then
                say_title("${questData.name}")
                say("감사합니다!")
                remove_item(${questData.rewards.item || 1}, 1)
                give_exp(${questData.rewards.exp})
                give_gold(${questData.rewards.gold})
                set_quest_flag("${questData.name}", 0)
            end
        end
    end
end`;
    } else if (questType === 'collection') {
      code = `quest ${questData.name} begin
    state start begin
        when login begin
            send_letter("${questData.name}")
        end
        
        when ${questData.npcVnum}.chat."${questData.name}" begin
            say_title("${questData.name}")
            say("${questData.targets[0]?.count || 5}개의 아이템을 모아주세요.")
            set_quest_flag("${questData.name}", 1)
        end
        
        when ${questData.npcVnum}.chat."제출" begin
            if get_quest_flag("${questData.name}") == 1 then
                say_title("${questData.name}")
                say("완료되었습니다!")
                give_exp(${questData.rewards.exp})
                give_gold(${questData.rewards.gold})
                set_quest_flag("${questData.name}", 0)
            end
        end
    end
end`;
    }

    setGeneratedCode(code);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Kod kopyalandı!');
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${questData.name}.lua`;
    a.click();
  };

  const addTarget = () => {
    setQuestData({
      ...questData,
      targets: [...questData.targets, { mobVnum: 1001, count: 10 }]
    });
  };

  const removeTarget = (idx) => {
    setQuestData({
      ...questData,
      targets: questData.targets.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Quest Generator</h1>
        <p className="text-text-muted">Lua quest kodları otomatik oluştur</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Settings */}
        <div className="col-span-2 space-y-4">
          {/* Quest Type */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Quest Türü</h3>
            <div className="grid grid-cols-2 gap-2">
              {questTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setQuestType(type.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    questType === type.value
                      ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
                      : 'bg-dark-hover border-dark-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">Temel Bilgiler</h3>
            
            <div>
              <label className="block text-text-primary text-sm font-medium mb-1">Quest Adı</label>
              <input
                type="text"
                value={questData.name}
                onChange={(e) => setQuestData({ ...questData, name: e.target.value })}
                className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-text-primary text-sm font-medium mb-1">NPC VNum</label>
                <input
                  type="number"
                  value={questData.npcVnum}
                  onChange={(e) => setQuestData({ ...questData, npcVnum: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                />
              </div>
              <div>
                <label className="block text-text-primary text-sm font-medium mb-1">Min Level</label>
                <input
                  type="number"
                  value={questData.level}
                  onChange={(e) => setQuestData({ ...questData, level: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                />
              </div>
            </div>
          </div>

          {/* Targets */}
          {questType === 'kill' && (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Hedefler</h3>
                <button
                  onClick={addTarget}
                  className="flex items-center space-x-1 text-sm bg-cyber-green/20 text-cyber-green px-2 py-1 rounded hover:bg-cyber-green/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ekle</span>
                </button>
              </div>

              {questData.targets.map((target, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mob VNum"
                    value={target.mobVnum}
                    onChange={(e) => {
                      const newTargets = [...questData.targets];
                      newTargets[idx].mobVnum = parseInt(e.target.value);
                      setQuestData({ ...questData, targets: newTargets });
                    }}
                    className="flex-1 px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  />
                  <input
                    type="number"
                    placeholder="Sayı"
                    value={target.count}
                    onChange={(e) => {
                      const newTargets = [...questData.targets];
                      newTargets[idx].count = parseInt(e.target.value);
                      setQuestData({ ...questData, targets: newTargets });
                    }}
                    className="w-20 px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  />
                  <button
                    onClick={() => removeTarget(idx)}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Rewards */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">Ödüller</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-text-primary text-sm font-medium mb-1">Exp</label>
                <input
                  type="number"
                  value={questData.rewards.exp}
                  onChange={(e) => setQuestData({
                    ...questData,
                    rewards: { ...questData.rewards, exp: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                />
              </div>
              <div>
                <label className="block text-text-primary text-sm font-medium mb-1">Gold</label>
                <input
                  type="number"
                  value={questData.rewards.gold}
                  onChange={(e) => setQuestData({
                    ...questData,
                    rewards: { ...questData.rewards, gold: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-primary text-sm font-medium mb-1">Item VNum (Opsiyonel)</label>
              <input
                type="number"
                value={questData.rewards.item}
                onChange={(e) => setQuestData({
                  ...questData,
                  rewards: { ...questData.rewards, item: e.target.value }
                })}
                className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                placeholder="Item VNum"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateLuaCode}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyber-green to-vivid-blue text-dark-bg px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyber-green/50 transition-all"
          >
            <Zap className="w-5 h-5" />
            <span>Lua Kodu Oluştur</span>
          </button>
        </div>

        {/* Code Preview */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4 flex flex-col h-fit">
          <h3 className="text-lg font-semibold text-text-primary mb-3">Oluşturulan Kod</h3>
          
          <textarea
            value={generatedCode}
            readOnly
            className="flex-1 px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-secondary font-mono text-xs focus:outline-none min-h-96 resize-none"
            placeholder="Kod burada gösterilecek..."
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCopyCode}
              disabled={!generatedCode}
              className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-4 h-4" />
              <span>Kopyala</span>
            </button>
            <button
              onClick={handleDownloadCode}
              disabled={!generatedCode}
              className="flex-1 flex items-center justify-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>İndir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestGenerator;
