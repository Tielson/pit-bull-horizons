import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Edit, 
  Save, 
  X, 
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  FlaskConical,
  Image as ImageIcon,
  ClipboardPaste,
  Gift,
  PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from "@/components/ui/checkbox";
import { templatesService } from '@/services/templatesService';

const WhatsAppIntegration = ({ panelLogo, panelTitle, clients, plans, messageTemplates: templatesFromProps = [], onTemplateCreated }) => {
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [pixInfo, setPixInfo] = useState(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    message: '',
    type: 'expiry'
  });
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [includePix, setIncludePix] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const fileInputRef = useRef(null);
  const newTemplateMessageRef = useRef(null);
  const editingTemplateMessageRef = useRef(null);
  
  // Função para inserir variável no textarea
  const insertVariable = (variable, textareaRef, setState, currentValue) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentValue || '';
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + variable + after;
    
    setState(newText);
    
    // Reposicionar cursor após a variável inserida
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };
  
  const parseDateToBrasilia = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month - 1, day);
  };
  
  const getTodayBrasilia = () => {
    const now = new Date();
    const brasiliaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    brasiliaDate.setHours(0, 0, 0, 0);
    return brasiliaDate;
  };

  useEffect(() => {
    const savedPixInfo = localStorage.getItem('pix_info');
    if (savedPixInfo) {
      setPixInfo(JSON.parse(savedPixInfo));
    }

    // Usar templates do Supabase passados via props
    if (templatesFromProps && templatesFromProps.length > 0) {
      setMessageTemplates(templatesFromProps);
    }
    
    const targetClient = localStorage.getItem('whatsapp_target_client');
    if (targetClient) {
        const client = JSON.parse(targetClient);
        setSelectedClients([client.id]);
        localStorage.removeItem('whatsapp_target_client');
        toast({
            title: `🎯 Cliente ${client.name} selecionado!`,
            description: "Escolha um template ou escreva uma mensagem para enviar.",
        });
    }

  }, [templatesFromProps, toast]);

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.message) {
      toast({ title: "❌ Erro", description: "Nome e mensagem são obrigatórios!", variant: "destructive" });
      return;
    }
    
    try {
      await templatesService.create(newTemplate);
      setNewTemplate({ name: '', subject: '', message: '', type: 'expiry' });
      toast({ title: "✅ Sucesso!", description: "Template adicionado e salvo no banco de dados!" });
      
      // Recarregar templates do Supabase
      if (onTemplateCreated) {
        await onTemplateCreated();
      }
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast({ 
        title: "❌ Erro", 
        description: error.message || "Não foi possível salvar o template.", 
        variant: "destructive" 
      });
    }
  };

  const handleEditTemplate = (template) => {
    setIsEditingTemplate({ ...template });
  };

  const handleSaveEdit = async () => {
    if (!isEditingTemplate || !isEditingTemplate.id) {
      toast({ title: "❌ Erro", description: "Template inválido!", variant: "destructive" });
      return;
    }
    
    try {
      await templatesService.update(isEditingTemplate.id, isEditingTemplate);
      setIsEditingTemplate(null);
      toast({ title: "✅ Sucesso!", description: "Template atualizado e salvo no banco de dados!" });
      
      // Recarregar templates do Supabase
      if (onTemplateCreated) {
        await onTemplateCreated();
      }
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      toast({ 
        title: "❌ Erro", 
        description: error.message || "Não foi possível atualizar o template.", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await templatesService.delete(templateId);
      toast({ title: "✅ Sucesso!", description: "Template removido com sucesso!" });
      
      // Recarregar templates do Supabase
      if (onTemplateCreated) {
        await onTemplateCreated();
      }
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      toast({ 
        title: "❌ Erro", 
        description: error.message || "Não foi possível remover o template.", 
        variant: "destructive" 
      });
    }
  };

  const handlePasteMessage = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error("A API de Clipboard não é suportada ou requer permissão.");
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        setCustomMessage(prev => prev ? `${prev}\n${text}` : text);
        setSelectedTemplate('');
        toast({ title: "📝 Mensagem Colada!", description: "O texto foi adicionado à sua mensagem personalizada." });
      } else {
        toast({ title: "⚠️ Nenhum texto encontrado", description: "Não foi encontrado texto na sua área de transferência.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Erro ao colar texto:", err);
      toast({ title: "❌ Erro ao colar", description: "Seu navegador pode não suportar esta ação ou precisa de permissão.", variant: "destructive" });
    }
  };

  const handleSendMessage = async () => {
    if (selectedClients.length === 0) {
      toast({ title: "❌ Erro", description: "Selecione pelo menos um cliente!", variant: "destructive" });
      return;
    }
    if (!selectedTemplate && !customMessage) {
      toast({ title: "❌ Erro", description: "Selecione um template ou digite uma mensagem!", variant: "destructive" });
      return;
    }

    const clientsToSend = clients.filter(c => selectedClients.includes(c.id));
    const template = messageTemplates.find(t => t.id.toString() === selectedTemplate);

    for (const [index, client] of clientsToSend.entries()) {
      let messageBody = customMessage;
      if (template) {
        messageBody = formatMessage(template, client);
      } else if (includePix) {
        const pixDetails = getPixDetails();
        messageBody = `${customMessage}\n\n${pixDetails}`;
      }

      if (client.phone) {
        if (attachedImage && navigator.canShare && navigator.canShare({ files: [attachedImage.file] })) {
          try {
            await navigator.share({
              files: [attachedImage.file],
              text: messageBody,
              title: template?.subject || panelTitle,
            });
            if (index === 0) toast({ title: "✅ Sucesso!", description: "Compartilhando mensagem com imagem..." });
          } catch (err) {
            console.error("Error sharing:", err);
            toast({ title: "❌ Erro ao compartilhar", description: "Não foi possível compartilhar a imagem.", variant: "destructive" });
            return; // Stop if sharing fails
          }
        } else {
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${client.phone.replace(/\D/g, '')}&text=${encodeURIComponent(messageBody)}`;
          setTimeout(() => {
            window.open(whatsappUrl, '_blank');
          }, index * 200);
          if (index === 0) toast({ title: "✅ Sucesso!", description: `Abrindo WhatsApp para enviar ${clientsToSend.length} mensagem(ns).` });
        }
      }
    }
  };

  const getPixDetails = () => {
    if (pixInfo && pixInfo.key) {
      return `
--- DADOS PIX ---
Nome: ${pixInfo.name}
Chave: ${pixInfo.key}
Banco: ${pixInfo.bank}
--------------------
${pixInfo.message}
      `.trim();
    }
    return '';
  };

  const formatMessage = (template, client) => {
    if (!template || !client) return '';
    let message = template.message;
    const expiryDate = client.expiryDate ? parseDateToBrasilia(client.expiryDate) : null;
    const today = getTodayBrasilia();
    const daysUntilExpiry = expiryDate ? Math.round((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Verificar se é um revendedor (tem credits ou login/password diretamente) ou cliente (tem credentials)
    const isReseller = client.credits !== undefined || (client.login !== undefined && !client.credentials);
    const firstCredential = client.credentials && client.credentials[0] ? client.credentials[0] : { login: '', password: '', appUsed: '' };
    
    // Para revendedores, usar login e password diretamente; para clientes, usar credentials
    const loginValue = isReseller ? (client.login || '') : (firstCredential.login || '');
    const passwordValue = isReseller ? (client.password || '') : (firstCredential.password || '');
    const appValue = isReseller ? '' : (firstCredential.appUsed || '');
    
    const clientPlan = plans.find(p => p.name === client.plan);
    const planPrice = clientPlan ? clientPlan.price : 'N/A';

    const pixDetails = getPixDetails();

    message = message.replace(/{nome}/g, client.name || '');
    message = message.replace(/{login}/g, loginValue);
    message = message.replace(/{senha}/g, passwordValue);
    message = message.replace(/{app}/g, appValue);
    message = message.replace(/{plano}/g, client.plan || '');
    message = message.replace(/{valor_plano}/g, planPrice);
    message = message.replace(/{data_vencimento}/g, expiryDate ? expiryDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '');
    message = message.replace(/{dias}/g, daysUntilExpiry > 0 ? daysUntilExpiry.toString() : '0');
    message = message.replace(/{dados_pix}/g, pixDetails);
    
    return `*${panelTitle}*\n\n${message}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'inactive': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      case 'active': return 'text-green-500';
      case 'test': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'inactive': return AlertTriangle;
      case 'pending': return Clock;
      case 'active': return CheckCircle;
      case 'test': return FlaskConical;
      default: return Users;
    }
  };

  const getTemplateIcon = (type) => {
    switch (type) {
      case 'expiry': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'welcome': return <PartyPopper className="w-4 h-4 text-green-400" />;
      default: return <Send className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-3xl font-bold gold-text mb-2">Integração WhatsApp</h2>
        <p className="text-gray-400">Gerencie e envie mensagens para seus clientes</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="glass-effect p-6 rounded-xl">
        <h3 className="text-xl font-semibold gold-text mb-4">Templates de Mensagem</h3>
        <div className="mb-6 p-4 bg-black/30 rounded-lg">
          <h4 className="text-lg font-medium text-white mb-3">Adicionar Novo Template</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" value={newTemplate.name} onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" placeholder="Nome do Template" />
            <select value={newTemplate.type} onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white">
              <option value="expiry">Vencimento</option>
              <option value="welcome">Boas-vindas</option>
              <option value="custom">Personalizada</option>
            </select>
          </div>
          <div className="mb-4"><input type="text" value={newTemplate.subject} onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" placeholder="Assunto da mensagem" /></div>
          <div className="mb-4">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Mensagem</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['{nome}', '{login}', '{senha}', '{app}', '{plano}', '{valor_plano}', '{data_vencimento}', '{dias}', '{dados_pix}'].map((varName) => (
                  <button
                    key={varName}
                    type="button"
                    onClick={() => insertVariable(varName, newTemplateMessageRef, (value) => setNewTemplate({...newTemplate, message: value}), newTemplate.message)}
                    className="px-2 py-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded text-yellow-400 font-mono transition-colors"
                  >
                    {varName}
                  </button>
                ))}
              </div>
            </div>
            <textarea 
              ref={newTemplateMessageRef}
              value={newTemplate.message} 
              onChange={(e) => setNewTemplate({...newTemplate, message: e.target.value})} 
              className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" 
              placeholder="Digite sua mensagem aqui..." 
              rows="4" 
            />
          </div>
          <Button onClick={handleAddTemplate} className="gold-gradient text-black hover:opacity-90"><Save className="w-4 h-4 mr-2" />Adicionar Template</Button>
        </div>
        <div className="space-y-4">
          {(Array.isArray(messageTemplates) ? messageTemplates : []).map((template, index) => (
            <motion.div key={template.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }} className="p-4 bg-black/20 rounded-lg border border-yellow-500/20">
              {isEditingTemplate && isEditingTemplate.id === template.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" value={isEditingTemplate.name} onChange={(e) => setIsEditingTemplate({...isEditingTemplate, name: e.target.value})} className="p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" placeholder="Nome do template" />
                    <select value={isEditingTemplate.type} onChange={(e) => setIsEditingTemplate({...isEditingTemplate, type: e.target.value})} className="p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white">
                      <option value="expiry">Vencimento</option>
                      <option value="welcome">Boas-vindas</option>
                      <option value="custom">Personalizada</option>
                    </select>
                  </div>
                  <input type="text" value={isEditingTemplate.subject} onChange={(e) => setIsEditingTemplate({...isEditingTemplate, subject: e.target.value})} className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" placeholder="Assunto" />
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['{nome}', '{login}', '{senha}', '{app}', '{plano}', '{valor_plano}', '{data_vencimento}', '{dias}', '{dados_pix}'].map((varName) => (
                        <button
                          key={varName}
                          type="button"
                          onClick={() => insertVariable(varName, editingTemplateMessageRef, (value) => setIsEditingTemplate({...isEditingTemplate, message: value}), isEditingTemplate.message)}
                          className="px-2 py-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded text-yellow-400 font-mono transition-colors"
                        >
                          {varName}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      ref={editingTemplateMessageRef}
                      value={isEditingTemplate.message} 
                      onChange={(e) => setIsEditingTemplate({...isEditingTemplate, message: e.target.value})} 
                      className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded focus:border-yellow-500 focus:outline-none text-white" 
                      rows="3" 
                    />
                  </div>
                  <div className="flex space-x-2"><Button onClick={handleSaveEdit} className="gold-gradient text-black hover:opacity-90" size="sm"><Save className="w-4 h-4 mr-2" />Salvar</Button><Button onClick={() => setIsEditingTemplate(null)} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" size="sm"><X className="w-4 h-4 mr-2" />Cancelar</Button></div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      {getTemplateIcon(template.type)}
                      <div>
                        <h4 className="text-lg font-semibold text-white">{template.name}</h4>
                        <p className="text-gray-400 text-sm">{template.subject}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2"><Button onClick={() => handleEditTemplate(template)} variant="ghost" className="text-yellow-500 hover:bg-yellow-500/10" size="sm"><Edit className="w-4 h-4" /></Button><Button onClick={() => handleDeleteTemplate(template.id)} variant="ghost" className="text-red-500 hover:bg-red-500/10" size="sm"><X className="w-4 h-4" /></Button></div>
                  </div>
                  <p className="text-gray-300 text-sm bg-black/30 p-3 rounded whitespace-pre-wrap">{template.message}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="glass-effect p-6 rounded-xl">
        <h3 className="text-xl font-semibold gold-text mb-4">Enviar Mensagens</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Selecionar Clientes</h4>
            <div className="max-h-64 overflow-y-auto scrollbar-gold space-y-2">
              {(Array.isArray(clients) ? clients : []).map((client) => {
                const status = client.status;
                const StatusIcon = getStatusIcon(status);
                return (
                  <label key={`${client.credits !== undefined ? 'reseller' : 'client'}-${client.id}`} className={`flex items-center space-x-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 cursor-pointer ${selectedClients.includes(client.id) ? 'border border-yellow-500' : 'border border-transparent'}`}>
                    <input type="checkbox" checked={selectedClients.includes(client.id)} onChange={(e) => { if (e.target.checked) { setSelectedClients([...selectedClients, client.id]); } else { setSelectedClients(selectedClients.filter(id => id !== client.id)); } }} className="w-4 h-4 text-yellow-500 bg-black border-yellow-500/30 rounded focus:ring-yellow-500" />
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(status)}`} />
                    <div className="flex-1"><p className="text-white font-medium">{client.name}</p><p className="text-gray-400 text-sm">{client.phone}</p></div>
                  </label>
                );
              })}
            </div>
            <div className="mt-3 flex space-x-2"><Button onClick={() => setSelectedClients((Array.isArray(clients) ? clients : []).map(c => c.id))} variant="outline" className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10" size="sm">Selecionar Todos</Button><Button onClick={() => setSelectedClients([])} variant="outline" className="border-gray-500/30 text-gray-500 hover:bg-gray-500/10" size="sm">Limpar Seleção</Button></div>
          </div>
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Compor Mensagem</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Template</label>
                <select value={selectedTemplate} onChange={(e) => {setSelectedTemplate(e.target.value); setCustomMessage('');}} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white">
                  <option value="">Selecione um template</option>
                  {(Array.isArray(messageTemplates) ? messageTemplates : []).map((template) => (<option key={template.id} value={template.id}>{template.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ou digite uma mensagem personalizada</label>
                <textarea value={customMessage} onChange={(e) => {setCustomMessage(e.target.value); setSelectedTemplate('');}} className="w-full p-3 bg-black/50 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:outline-none text-white" placeholder="Digite sua mensagem aqui..." rows="4" />
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handlePasteMessage} variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500/10">
                    <ClipboardPaste className="w-4 h-4 mr-2" />
                    Colar Mensagem
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" />
              </div>
              {attachedImage && <div className="flex items-center gap-2 text-sm text-cyan-400"><ImageIcon size={16} /><p>Imagem anexada</p><X size={16} className="cursor-pointer" onClick={() => setAttachedImage(null)} /></div>}
              {!selectedTemplate && pixInfo && pixInfo.key && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="includePix" checked={includePix} onCheckedChange={setIncludePix} />
                  <label htmlFor="includePix" className="text-sm font-medium text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Incluir dados do PIX
                  </label>
                </div>
              )}
              {(selectedTemplate || customMessage) && selectedClients.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preview (primeiro cliente selecionado)</label>
                  <div className="p-3 bg-black/30 rounded-lg border border-yellow-500/20 max-h-40 overflow-y-auto scrollbar-gold relative">
                    {panelLogo && <img src={panelLogo} alt="Logo" className="absolute top-2 right-2 max-h-10 opacity-20"/>}
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {selectedTemplate 
                        ? formatMessage(messageTemplates.find(t => t.id.toString() === selectedTemplate), clients.find(c => c.id === selectedClients[0]))
                        : `${customMessage}${includePix ? `\n\n${getPixDetails()}` : ''}`
                      }
                    </p>
                  </div>
                </div>
              )}
              <Button onClick={handleSendMessage} className="w-full gold-gradient text-black hover:opacity-90" disabled={selectedClients.length === 0}>
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem ({selectedClients.length} cliente{selectedClients.length !== 1 ? 's' : ''})
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WhatsAppIntegration;