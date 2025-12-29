import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { receiptsService } from '@/services/receiptsService';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { Calendar, Check, Copy, Download, History, Save, Shield, Star, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const RenewalReceipts = ({ setActiveSection, panelTitle, panelLogo, clients, saveReceipts, onReceiptCreated, plans }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [receiptImageForModal, setReceiptImageForModal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const receiptPreviewRef = useRef(null);

  const getBrasiliaDate = () => {
    const now = new Date();
    const brasiliaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return brasiliaDate;
  };

  const parseDateToBrasilia = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    return date;
  };
  
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseDateToBrasilia(dateString);
    if (!date) return 'N/A';
    return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  useEffect(() => {
    setReceiptDate(new Date().toLocaleDateString('pt-BR'));

    const targetClient = localStorage.getItem('receipt_target_client');
    if (targetClient) {
      const client = JSON.parse(targetClient);
      const uniqueId = `${client.credits !== undefined ? 'reseller' : 'client'}-${client.id}`;
      setSelectedClientId(uniqueId);
      localStorage.removeItem('receipt_target_client');
    }
  }, []);

  const getClientById = (uniqueId) => {
    if (!uniqueId) return null;
    const dashIndex = uniqueId.indexOf('-');
    const type = uniqueId.substring(0, dashIndex);
    const id = uniqueId.substring(dashIndex + 1);
    
    return (Array.isArray(clients) ? clients : []).find(c => 
      c.id && id && c.id.toString() === id.toString() && (c.credits !== undefined ? 'reseller' : 'client') === type
    );
  };

  const selectedClient = getClientById(selectedClientId);

  const generateReceiptImage = async () => {
    if (!receiptPreviewRef.current) {
      toast({ title: "❌ Erro", description: "Referência do comprovante não encontrada.", variant: "destructive" });
      return null;
    }
    try {
      const dataUrl = await toPng(receiptPreviewRef.current, { 
        cacheBust: true, 
        pixelRatio: 2.5,
        style: {
          margin: '0',
        }
      });
      return dataUrl;
    } catch (err) {
      console.error('Erro ao gerar imagem do comprovante:', err);
      toast({ title: "❌ Erro ao gerar imagem", description: "Houve um problema ao criar a imagem do comprovante.", variant: "destructive" });
      return null;
    }
  };

  const handleSaveReceipt = async (imageUrl) => {
    if (!selectedClient || !imageUrl || isSaving) return;

    setIsSaving(true);
    try {
      const plan = plans.find(p => p.name === selectedClient.plan);
      
      const newReceipt = {
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientType: selectedClient.credits !== undefined ? 'reseller' : 'client',
        plan: selectedClient.plan,
        amount: plan ? plan.price : '0',
        date: new Date().toLocaleDateString('pt-BR'),
        expiryDate: selectedClient.expiryDate,
        imageUrl: imageUrl,
      };

      await receiptsService.create(newReceipt);
      
      toast({ title: "🧾 Comprovante Salvo!", description: "O comprovante foi salvo no histórico do cliente e no banco de dados." });
      
      if (onReceiptCreated) {
        await onReceiptCreated();
      }
    } catch (error) {
      console.error('Erro ao salvar comprovante no Supabase:', error);
      toast({ 
        title: "❌ Erro ao salvar", 
        description: "Não foi possível salvar o comprovante no banco de dados.",
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyImage = async () => {
    if (!selectedClient) {
      toast({ title: "⚠️ Atenção", description: "Selecione um cliente primeiro.", variant: "destructive" });
      return;
    }
    const dataUrl = await generateReceiptImage();
    if (!dataUrl) return;
    
    try {
      if (!navigator.clipboard || !navigator.clipboard.write || typeof ClipboardItem === 'undefined') {
        throw new Error("A cópia de imagens não é suportada neste navegador.");
      }
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast({ title: "🖼️ Imagem Copiada!", description: "Comprovante copiado para a área de transferência." });
      await handleSaveReceipt(dataUrl);
    } catch (error) {
      console.error('Falha ao copiar imagem:', error);
      setReceiptImageForModal(dataUrl);
      setIsCopyModalOpen(true);
      await handleSaveReceipt(dataUrl);
    }
  };

  const handleDownload = async () => {
    if (!selectedClient) {
      toast({ title: "⚠️ Atenção", description: "Selecione um cliente primeiro.", variant: "destructive" });
      return;
    }
    const dataUrl = await generateReceiptImage();
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = `comprovante-${selectedClient?.name.replace(/\s+/g, '-') || 'cliente'}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "✅ Baixado!", description: "Download do comprovante iniciado." });
    await handleSaveReceipt(dataUrl);
  };

  const handleViewHistory = () => {
    if (!selectedClient) {
      toast({ title: "⚠️ Atenção", description: "Selecione um cliente para ver o histórico.", variant: "destructive" });
      return;
    }
    localStorage.setItem('view_receipts_client', JSON.stringify(selectedClient));
    setActiveSection(selectedClient.credits !== undefined ? 'resellers' : 'clients');
  };

  return (
    <>
      <Dialog open={isCopyModalOpen} onOpenChange={setIsCopyModalOpen}>
        <DialogContent className="bg-gray-900 border-yellow-500/50 text-white">
          <DialogHeader>
            <DialogTitle>Copie a Imagem Manualmente</DialogTitle>
            <DialogDescription className="text-gray-400">
              Seu navegador não suporta a cópia direta. Por favor, copie a imagem abaixo:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-black rounded-lg flex justify-center">
            <img src={receiptImageForModal} alt="Comprovante para cópia" className="max-w-full h-auto rounded-md" />
          </div>
          <p className="text-sm text-center text-yellow-400 mt-2">
            Clique com o botão direito (ou pressione e segure no celular) e selecione "Copiar Imagem".
          </p>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl font-bold gold-text mb-2">Comprovantes de Renovação</h2>
          <p className="text-gray-400">Gere e envie comprovantes de pagamento para seus clientes.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-1 space-y-4 glass-effect p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-2">Configurações</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Selecionar Cliente</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
              >
                <option value="">Selecione um cliente ou revendedor</option>
                {(Array.isArray(clients) ? clients : []).map(client => {
                  const uniqueId = `${client.credits !== undefined ? 'reseller' : 'client'}-${client.id}`;
                  return (
                    <option key={uniqueId} value={uniqueId}>
                      {client.name} {client.credits !== undefined ? '(Revendedor)' : '(Cliente)'}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data do Comprovante</label>
              <input
                type="text"
                value={receiptDate}
                readOnly
                className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg text-gray-400"
              />
            </div>
            <Button 
              onClick={() => generateReceiptImage().then(url => handleSaveReceipt(url))} 
              variant="gold" 
              className="w-full" 
              disabled={!selectedClient || isSaving}
            >
              {isSaving ? 'Salvando...' : <><Save className="w-4 h-4 mr-2" /> Salvar no Histórico</>}
            </Button>
            <Button onClick={handleViewHistory} variant="outline" className="w-full border-purple-500 text-purple-500 hover:bg-purple-500/10" disabled={!selectedClient}>
              <History className="w-4 h-4 mr-2" /> Ver Histórico
            </Button>
            <Button onClick={() => setActiveSection('clients')} variant="outline" className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
              &larr; Voltar para Clientes
            </Button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="glass-effect p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-white mb-4">Preview do Comprovante</h3>
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg border border-yellow-500/20 relative overflow-hidden shadow-2xl shadow-yellow-500/10">
                <div ref={receiptPreviewRef} className="p-8 bg-gradient-to-br from-gray-900 to-black text-white">
                  {panelLogo && <img src={panelLogo} alt="Watermark" className="absolute inset-0 w-full h-full object-contain opacity-10 z-0" />}
                  <div className="relative z-10">
                    <div className="flex justify-between items-start pb-4 mb-6 border-b border-yellow-500/30">
                      <div className="text-left">
                        {panelLogo ? <img src={panelLogo} alt="Panel Logo" className="h-12 object-contain" /> : <div className="h-12 w-12 bg-yellow-500/20 rounded-md"></div>}
                        <p className="font-bold text-2xl gold-text mt-2">{panelTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white text-lg">Comprovante de Renovação</p>
                        <p className="text-gray-400 text-sm">Data: {receiptDate}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-gray-400 text-sm font-medium mb-1">CLIENTE</p>
                      <div className="flex items-center gap-3 bg-black/20 p-3 rounded-lg border border-white/10">
                        <div className="bg-yellow-500/10 p-2 rounded-full"><User className="w-5 h-5 text-yellow-500" /></div>
                        <p className="font-semibold text-lg">{selectedClient?.name || 'Nome do Cliente'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/20 p-3 rounded-lg border border-white/10">
                        <p className="text-gray-400 text-sm font-medium mb-1">PLANO</p>
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-yellow-500" />
                          <p className="font-semibold text-md">{selectedClient?.plan || 'Plano do Cliente'}</p>
                        </div>
                      </div>
                      <div className="bg-black/20 p-3 rounded-lg border border-white/10">
                        <p className="text-gray-400 text-sm font-medium mb-1">NOVO VENCIMENTO</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-yellow-500" />
                          <p className="font-semibold text-md">{formatDateForDisplay(selectedClient?.expiryDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 text-center bg-green-900/50 p-4 rounded-lg border border-green-400/30 shadow-lg shadow-green-500/10">
                      <div className="flex items-center justify-center gap-3">
                        <Check className="w-6 h-6 text-green-300" />
                        <div>
                          <p className="text-green-300 font-bold text-lg">ASSINATURA RENOVADA!</p>
                          <p className="text-gray-300 text-sm">Seu acesso foi estendido com sucesso.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      <div className="flex justify-center items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4" />
                        <Star className="w-4 h-4" />
                        <Star className="w-4 h-4" />
                        <Star className="w-4 h-4" />
                        <Star className="w-4 h-4" />
                      </div>
                      <p className="text-gray-300 mt-2">Agradecemos a preferência! Aproveite o melhor conteúdo.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button onClick={handleCopyImage} variant="outline" className="w-full border-cyan-500 text-cyan-500 hover:bg-cyan-500/10" disabled={!selectedClient || isSaving}>
                  <Copy className="w-4 h-4 mr-2" /> Copiar
                </Button>
                <Button onClick={handleDownload} variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-500/10" disabled={!selectedClient || isSaving}>
                  <Download className="w-4 h-4 mr-2" /> Baixar
                </Button>
                <Button 
                  onClick={async () => {
                    const img = await generateReceiptImage();
                    if (img) await handleSaveReceipt(img);
                  }} 
                  variant="gold" 
                  className="w-full" 
                  disabled={!selectedClient || isSaving}
                >
                  <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RenewalReceipts;