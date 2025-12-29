import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Save, Clipboard, ClipboardCheck, 
  ImagePlus, Copy, X, Download, Plus, 
  Trash2, Edit2, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { toPng } from 'html-to-image';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { pixService } from '@/services/pixService';

const PixManagement = ({ panelLogo, panelTitle }) => {
  const [pixInfo, setPixInfo] = useState({
    label: '',
    name: '',
    key: '',
    bank: '',
    message: 'Após o pagamento, por favor, envie o comprovante para confirmarmos a sua renovação. Obrigado! 🙏'
  });
  
  const [pixList, setPixList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  
  const [copied, setCopied] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const pixPreviewRef = useRef(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadPixSettings();
  }, []);

  const loadPixSettings = async () => {
    try {
      setLoading(true);
      const data = await pixService.getAll();
      setPixList(data || []);
      
      // Se houver itens, selecionar o primeiro por padrão se nenhum estiver selecionado
      if (data && data.length > 0 && !selectedId) {
        handleSelectPix(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar PIX:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPix = (pix) => {
    setPixInfo({
      label: pix.label,
      name: pix.name,
      key: pix.key,
      bank: pix.bank,
      message: pix.message
    });
    setSelectedId(pix.id);
    setEditingId(pix.id);
  };

  const handleResetForm = () => {
    setPixInfo({
      label: '',
      name: '',
      key: '',
      bank: '',
      message: 'Após o pagamento, por favor, envie o comprovante para confirmarmos a sua renovação. Obrigado! 🙏'
    });
    setEditingId(null);
    setSelectedId(null);
  };

  const handleSave = async () => {
    if (!pixInfo.label || !pixInfo.key) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Por favor, preencha pelo menos o Nome do Identificador e a Chave PIX.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const updated = await pixService.update(editingId, pixInfo);
        setPixList(prev => prev.map(item => item.id === editingId ? updated : item));
        toast({ title: "✅ Atualizado!", description: "Configuração PIX atualizada com sucesso." });
      } else {
        const created = await pixService.create(pixInfo);
        setPixList(prev => [created, ...prev]);
        setEditingId(created.id);
        setSelectedId(created.id);
        toast({ title: "✅ Salvo!", description: "Nova configuração PIX salva com sucesso." });
      }
    } catch (error) {
      console.error('Erro ao salvar PIX:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar no banco de dados. Verifique sua conexão.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir esta configuração PIX?')) return;

    try {
      await pixService.delete(id);
      setPixList(prev => prev.filter(item => item.id !== id));
      if (selectedId === id) {
        handleResetForm();
      }
      toast({ title: "🗑️ Excluído", description: "Configuração removida com sucesso." });
    } catch (error) {
      console.error('Erro ao excluir PIX:', error);
      toast({ title: "❌ Erro", description: "Não foi possível excluir.", variant: "destructive" });
    }
  };

  const handleCopyText = async () => {
    const textToCopy = `
*${panelTitle}*
*Dados para pagamento PIX:*
-----------------------------------
Nome: ${pixInfo.name}
Chave PIX: ${pixInfo.key}
Banco: ${pixInfo.bank}
-----------------------------------
${pixInfo.message}
    `.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({ title: "📋 Copiado!", description: "Mensagem PIX copiada para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "❌ Erro ao copiar", variant: "destructive" });
    }
  };

  const handleGenerateImage = () => {
    if (!pixPreviewRef.current) return;
    setIsGenerating(true);
    toPng(pixPreviewRef.current, { cacheBust: true, backgroundColor: '#1a1a1a', pixelRatio: 2.5 })
      .then((dataUrl) => {
        setGeneratedImage(dataUrl);
        setIsImageModalOpen(true);
      })
      .catch((err) => {
        toast({ title: "❌ Erro ao gerar imagem", variant: "destructive" });
      })
      .finally(() => setIsGenerating(false));
  };

  const handleCopyImage = async () => {
    if (!generatedImage) return;
    try {
      const blob = await (await fetch(generatedImage)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast({ title: "🖼️ Imagem Copiada!" });
    } catch (error) {
      toast({ title: "❌ Erro ao copiar", description: "Tente baixar a imagem.", variant: "destructive" });
    }
  };

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-3xl font-bold gold-text mb-2">Gerenciamento de PIX</h2>
          <p className="text-gray-400">Configure e gerencie suas chaves PIX para pagamentos.</p>
        </div>
        <Button onClick={handleResetForm} variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
          <Plus className="w-4 h-4 mr-2" /> Novo PIX
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de PIX Salvos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-yellow-500" />
            PIXs Salvos
          </h3>
          
          <div className="glass-effect rounded-xl overflow-hidden border border-white/5 max-h-[600px] overflow-y-auto scrollbar-gold">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Carregando...</p>
              </div>
            ) : pixList.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 italic">Nenhum PIX salvo ainda.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {pixList.map((pix) => (
                  <div
                    key={pix.id}
                    onClick={() => handleSelectPix(pix)}
                    className={`p-4 cursor-pointer transition-all hover:bg-white/5 group relative ${
                      selectedId === pix.id ? 'bg-yellow-500/10 border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold ${selectedId === pix.id ? 'gold-text' : 'text-white'}`}>
                          {pix.label}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-[150px]">{pix.key}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{pix.bank}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          onClick={(e) => handleDelete(e, pix.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {selectedId === pix.id && (
                      <div className="absolute right-2 bottom-2">
                        <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Formulário e Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="glass-effect p-6 rounded-xl border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna do Formulário */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-yellow-500" />
                  {editingId ? 'Editar Configuração' : 'Nova Configuração'}
                </h3>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Nome do Identificador (Ex: Pix Principal)</label>
                  <input
                    type="text"
                    value={pixInfo.label}
                    onChange={(e) => setPixInfo({ ...pixInfo, label: e.target.value })}
                    className="w-full p-2.5 bg-black/50 border border-yellow-500/20 rounded-lg focus:border-yellow-500 focus:outline-none text-white text-sm"
                    placeholder="Dê um nome para este PIX"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Nome do Titular</label>
                    <input
                      type="text"
                      value={pixInfo.name}
                      onChange={(e) => setPixInfo({ ...pixInfo, name: e.target.value })}
                      className="w-full p-2.5 bg-black/50 border border-yellow-500/20 rounded-lg focus:border-yellow-500 focus:outline-none text-white text-sm"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Chave PIX</label>
                    <input
                      type="text"
                      value={pixInfo.key}
                      onChange={(e) => setPixInfo({ ...pixInfo, key: e.target.value })}
                      className="w-full p-2.5 bg-black/50 border border-yellow-500/20 rounded-lg focus:border-yellow-500 focus:outline-none text-white text-sm"
                      placeholder="CPF, E-mail, Telefone ou Chave"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Banco / Instituição</label>
                    <input
                      type="text"
                      value={pixInfo.bank}
                      onChange={(e) => setPixInfo({ ...pixInfo, bank: e.target.value })}
                      className="w-full p-2.5 bg-black/50 border border-yellow-500/20 rounded-lg focus:border-yellow-500 focus:outline-none text-white text-sm"
                      placeholder="Ex: Nubank, Inter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Mensagem Padrão</label>
                  <textarea
                    value={pixInfo.message}
                    onChange={(e) => setPixInfo({ ...pixInfo, message: e.target.value })}
                    className="w-full p-2.5 bg-black/50 border border-yellow-500/20 rounded-lg focus:border-yellow-500 focus:outline-none text-white text-sm min-h-[80px]"
                    placeholder="Instruções para o cliente"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full gold-gradient text-black hover:opacity-90 font-bold"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingId ? 'Atualizar PIX' : 'Salvar Novo PIX'}
                </Button>
              </div>

              {/* Coluna do Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <ImagePlus className="w-4 h-4 text-yellow-500" />
                  Preview e Ações
                </h3>
                
                <div ref={pixPreviewRef} className="p-5 bg-[#0f0f0f] rounded-xl border border-yellow-500/20 relative overflow-hidden shadow-2xl">
                  {panelLogo && (
                    <img src={panelLogo} alt="Watermark" className="absolute inset-0 w-full h-full object-contain opacity-[0.03] z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="text-center mb-5 pb-5 border-b border-yellow-500/10">
                      {panelLogo ? (
                        <img src={panelLogo} alt="Logo" className="h-12 mx-auto mb-2 object-contain" />
                      ) : (
                        <div className="h-12 w-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <DollarSign className="w-6 h-6 text-yellow-500" />
                        </div>
                      )}
                      <p className="font-bold text-base gold-text uppercase tracking-widest">{panelTitle}</p>
                      <p className="text-white/60 text-xs mt-1">Dados para Pagamento PIX</p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <span className="text-gray-400 text-xs uppercase">Titular</span>
                        <span className="text-white font-medium">{pixInfo.name || "---"}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <span className="text-gray-400 text-xs uppercase">Chave PIX</span>
                        <span className="text-yellow-500 font-bold">{pixInfo.key || "---"}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <span className="text-gray-400 text-xs uppercase">Banco</span>
                        <span className="text-white font-medium">{pixInfo.bank || "---"}</span>
                      </div>
                      
                      {pixInfo.message && (
                        <div className="mt-4 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10 italic text-center text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                          "{pixInfo.message}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleCopyText}
                    variant="outline"
                    className="w-full border-white/10 text-white hover:bg-white/5"
                    disabled={!pixInfo.key}
                  >
                    {copied ? <ClipboardCheck className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2 text-yellow-500" />}
                    {copied ? 'Copiado!' : 'Texto'}
                  </Button>
                  <Button
                    onClick={handleGenerateImage}
                    className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    disabled={!pixInfo.key || isGenerating}
                  >
                    <ImagePlus className="w-4 h-4 mr-2 text-cyan-500" />
                    {isGenerating ? 'Gerando...' : 'Imagem'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Imagem Gerada */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border-yellow-500/30 text-white max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="gold-text text-xl">Imagem PIX Gerada</DialogTitle>
            <DialogDescription className="text-gray-400">
              Sua imagem está pronta para ser enviada ao cliente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            <div className="relative group">
              {generatedImage && (
                <img 
                  src={generatedImage} 
                  alt="PIX Info" 
                  className="rounded-xl border border-white/10 w-full shadow-2xl" 
                />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <p className="text-white font-bold text-lg">Pronto para Enviar</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleCopyImage} className="gold-gradient text-black font-bold h-12">
                <Copy className="w-5 h-5 mr-2" /> Copiar Imagem
              </Button>
              <Button onClick={() => downloadImage(generatedImage, `pix-${pixInfo.label.toLowerCase().replace(/\s+/g, '-')}.png`)} variant="outline" className="border-white/20 text-white h-12 hover:bg-white/5">
                <Download className="w-5 h-5 mr-2 text-blue-400" /> Baixar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PixManagement;
