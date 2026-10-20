/* Local interface translations. No network translation or project data sharing.
 * Columns: English | Spanish | Russian | French | German | Portuguese | Arabic | Chinese.
 * Product names, project content, server errors and CLI output remain original.
 */
(() => {
  'use strict';
  const rows = `Log in|Iniciar sesión|Войти|Se connecter|Anmelden|Entrar|تسجيل الدخول|登录
Appearance & language|Apariencia e idioma|Внешний вид и язык|Apparence et langue|Darstellung und Sprache|Aparência e idioma|المظهر واللغة|外观与语言
Display mode|Modo de visualización|Режим отображения|Mode d’affichage|Anzeigemodus|Modo de exibição|وضع العرض|显示模式
Close account menu|Cerrar menú de cuenta|Закрыть меню аккаунта|Fermer le menu du compte|Kontomenü schließen|Fechar menu da conta|إغلاق قائمة الحساب|关闭账户菜单
Overview|Resumen|Обзор|Vue d’ensemble|Übersicht|Visão geral|نظرة عامة|概览
Workspace|Espacio de trabajo|Рабочая область|Espace de travail|Arbeitsbereich|Área de trabalho|مساحة العمل|工作区
WORKSPACE|ESPACIO DE TRABAJO|РАБОЧАЯ ОБЛАСТЬ|ESPACE DE TRAVAIL|ARBEITSBEREICH|ÁREA DE TRABALHO|مساحة العمل|工作区
MANAGEMENT|ADMINISTRACIÓN|УПРАВЛЕНИЕ|GESTION|VERWALTUNG|GESTÃO|الإدارة|管理
Websites|Sitios web|Сайты|Sites web|Websites|Sites|المواقع|网站
Deployments|Despliegues|Развёртывания|Déploiements|Bereitstellungen|Implantações|عمليات النشر|部署
Activity logs|Registros de actividad|Журнал действий|Journaux d’activité|Aktivitätsprotokolle|Registros de atividade|سجل النشاط|活动日志
Settings & setup|Configuración|Настройки|Paramètres|Einstellungen|Configurações|الإعدادات|设置
Easy Publish|Publicación fácil|Простая публикация|Publication facile|Einfach veröffentlichen|Publicação fácil|النشر السهل|轻松发布
Firebase Console|Consola de Firebase|Консоль Firebase|Console Firebase|Firebase-Konsole|Console Firebase|وحدة تحكم Firebase|Firebase 控制台
My workspace|Mi espacio de trabajo|Моя рабочая область|Mon espace de travail|Mein Arbeitsbereich|Minha área de trabalho|مساحة عملي|我的工作区
All Firebase projects|Todos los proyectos Firebase|Все проекты Firebase|Tous les projets Firebase|Alle Firebase-Projekte|Todos os projetos Firebase|جميع مشاريع Firebase|所有 Firebase 项目
Your Firebase projects|Tus proyectos Firebase|Ваши проекты Firebase|Vos projets Firebase|Ihre Firebase-Projekte|Seus projetos Firebase|مشاريع Firebase الخاصة بك|您的 Firebase 项目
Choose a project to filter Websites.|Elige un proyecto para filtrar los sitios.|Выберите проект для фильтрации сайтов.|Choisissez un projet pour filtrer les sites.|Wählen Sie ein Projekt zum Filtern.|Escolha um projeto para filtrar os sites.|اختر مشروعًا لتصفية المواقع.|选择项目以筛选网站。
All projects|Todos los proyectos|Все проекты|Tous les projets|Alle Projekte|Todos os projetos|كل المشاريع|所有项目
Account & setup →|Cuenta y configuración →|Аккаунт и настройки →|Compte et paramètres →|Konto und Einrichtung →|Conta e configurações →|الحساب والإعدادات ←|账户与设置 →
Your account|Tu cuenta|Ваш аккаунт|Votre compte|Ihr Konto|Sua conta|حسابك|您的账户
Local administrator|Administrador local|Локальный администратор|Administrateur local|Lokaler Administrator|Administrador local|المسؤول المحلي|本地管理员
Account details|Detalles de la cuenta|Данные аккаунта|Détails du compte|Kontodetails|Detalhes da conta|تفاصيل الحساب|账户详情
Language|Idioma|Язык|Langue|Sprache|Idioma|اللغة|语言
Color theme|Tema de color|Цветовая тема|Thème de couleur|Farbthema|Tema de cores|ألوان الواجهة|颜色主题
Flame|Llama|Пламя|Flamme|Flamme|Chama|اللهب|火焰
Classic|Clásico|Классическая|Classique|Klassisch|Clássico|كلاسيكي|经典
Dark mode|Modo oscuro|Тёмный режим|Mode sombre|Dunkelmodus|Modo escuro|الوضع الداكن|深色模式
Light mode|Modo claro|Светлый режим|Mode clair|Hellmodus|Modo claro|الوضع الفاتح|浅色模式
Switch to dark mode|Activar modo oscuro|Включить тёмный режим|Activer le mode sombre|Dunkelmodus aktivieren|Ativar modo escuro|تفعيل الوضع الداكن|切换为深色模式
Switch to light mode|Activar modo claro|Включить светлый режим|Activer le mode clair|Hellmodus aktivieren|Ativar modo claro|تفعيل الوضع الفاتح|切换为浅色模式
Log out|Cerrar sesión|Выйти|Se déconnecter|Abmelden|Sair|تسجيل الخروج|退出登录
Refresh|Actualizar|Обновить|Actualiser|Aktualisieren|Atualizar|تحديث|刷新
Refresh projects and websites|Actualizar proyectos y sitios|Обновить проекты и сайты|Actualiser les projets et sites|Projekte und Websites aktualisieren|Atualizar projetos e sites|تحديث المشاريع والمواقع|刷新项目和网站
Refresh all websites|Actualizar todos los sitios|Обновить все сайты|Actualiser tous les sites|Alle Websites aktualisieren|Atualizar todos os sites|تحديث جميع المواقع|刷新所有网站
Sync|Sincronizar|Синхронизировать|Synchroniser|Synchronisieren|Sincronizar|مزامنة|同步
Upload website|Subir sitio web|Загрузить сайт|Importer un site|Website hochladen|Enviar site|رفع موقع|上传网站
Upload new build|Subir nueva compilación|Загрузить новую сборку|Importer une nouvelle version|Neuen Build hochladen|Enviar nova compilação|رفع إصدار جديد|上传新构建
Upload build|Subir compilación|Загрузить сборку|Importer la version|Build hochladen|Enviar compilação|رفع الإصدار|上传构建
Good to see you|Qué gusto verte|Рады вас видеть|Heureux de vous revoir|Schön, Sie zu sehen|Bom ver você|مرحبًا بعودتك|欢迎回来
YOUR HOSTING WORKSPACE|TU ESPACIO DE ALOJAMIENTO|ВАША ОБЛАСТЬ ХОСТИНГА|VOTRE ESPACE D’HÉBERGEMENT|IHR HOSTING-ARBEITSBEREICH|SEU ESPAÇO DE HOSPEDAGEM|مساحة الاستضافة الخاصة بك|您的托管工作区
Manage all your Firebase websites from one beautiful dashboard.|Gestiona tus sitios Firebase desde un solo panel.|Управляйте всеми сайтами Firebase с одной панели.|Gérez vos sites Firebase depuis un seul tableau de bord.|Verwalten Sie Ihre Firebase-Websites zentral.|Gerencie seus sites Firebase em um só painel.|أدر جميع مواقع Firebase من لوحة واحدة.|在一个控制面板中管理所有 Firebase 网站。
Your websites|Tus sitios web|Ваши сайты|Vos sites web|Ihre Websites|Seus sites|مواقعك|您的网站
Every Hosting site across the Firebase projects you can access.|Todos los sitios de los proyectos Firebase a los que tienes acceso.|Все сайты доступных вам проектов Firebase.|Tous les sites des projets Firebase accessibles.|Alle Hosting-Sites Ihrer zugänglichen Firebase-Projekte.|Todos os sites dos projetos Firebase acessíveis.|كل مواقع الاستضافة في مشاريع Firebase المتاحة لك.|您有权访问的 Firebase 项目中的所有托管网站。
Deployment center|Centro de despliegues|Центр развёртывания|Centre de déploiement|Bereitstellungszentrum|Central de implantações|مركز النشر|部署中心
A complete history of your production and preview releases.|Historial de versiones de producción y vista previa.|История рабочих и предварительных выпусков.|Historique des versions de production et d’aperçu.|Verlauf Ihrer Produktions- und Vorschauversionen.|Histórico de versões de produção e prévia.|سجل إصدارات الإنتاج والمعاينة.|生产版本和预览版本的完整历史记录。
Activity & logs|Actividad y registros|Действия и журналы|Activité et journaux|Aktivität und Protokolle|Atividade e registros|النشاط والسجلات|活动与日志
Real-time command output, deployment history and error details.|Salida en tiempo real, historial y detalles de errores.|Вывод команд, история развёртываний и ошибки.|Sortie en temps réel, historique et erreurs.|Live-Befehlsausgabe, Verlauf und Fehlerdetails.|Saída em tempo real, histórico e erros.|مخرجات الأوامر المباشرة وسجل النشر والأخطاء.|实时命令输出、部署历史记录和错误详情。
Connect the Firebase CLI and manage your deployment environment.|Conecta Firebase CLI y gestiona tu entorno.|Подключите Firebase CLI и настройте среду.|Connectez Firebase CLI et gérez votre environnement.|Firebase CLI verbinden und Umgebung verwalten.|Conecte o Firebase CLI e gerencie seu ambiente.|اربط Firebase CLI وأدر بيئة النشر.|连接 Firebase CLI 并管理部署环境。
Hosting websites|Sitios alojados|Сайты на хостинге|Sites hébergés|Gehostete Websites|Sites hospedados|مواقع مستضافة|托管网站
Local builds ready|Compilaciones locales listas|Готовые локальные сборки|Versions locales prêtes|Lokale Builds bereit|Compilações locais prontas|إصدارات محلية جاهزة|就绪的本地构建
Successful deployments|Despliegues exitosos|Успешные развёртывания|Déploiements réussis|Erfolgreiche Bereitstellungen|Implantações bem-sucedidas|عمليات نشر ناجحة|成功的部署
Active deployments|Despliegues activos|Активные развёртывания|Déploiements actifs|Aktive Bereitstellungen|Implantações ativas|عمليات نشر نشطة|进行中的部署
Across your accessible projects|En tus proyectos accesibles|Во всех доступных проектах|Dans vos projets accessibles|In Ihren zugänglichen Projekten|Nos seus projetos acessíveis|عبر المشاريع المتاحة|所有可访问项目
Prepared for deployment|Listas para desplegar|Готово к развёртыванию|Prêtes à déployer|Bereit zur Veröffentlichung|Prontas para implantar|جاهزة للنشر|已准备好部署
Running in the background|Ejecutándose en segundo plano|Выполняется в фоне|En cours en arrière-plan|Läuft im Hintergrund|Em execução em segundo plano|تعمل في الخلفية|后台运行中
Choose where to publish your latest build.|Elige dónde publicar tu última versión.|Выберите место публикации новой сборки.|Choisissez où publier votre version.|Wählen Sie das Ziel für Ihren Build.|Escolha onde publicar sua versão.|اختر مكان نشر أحدث إصدار.|选择最新构建的发布位置。
View all websites|Ver todos los sitios|Все сайты|Voir tous les sites|Alle Websites anzeigen|Ver todos os sites|عرض كل المواقع|查看所有网站
Recent deployments|Despliegues recientes|Последние развёртывания|Déploiements récents|Letzte Bereitstellungen|Implantações recentes|عمليات النشر الأخيرة|最近的部署
Quick setup|Configuración rápida|Быстрая настройка|Configuration rapide|Schnelle Einrichtung|Configuração rápida|إعداد سريع|快速设置
View setup guide|Ver guía de configuración|Руководство по настройке|Voir le guide|Einrichtungsanleitung|Ver guia de configuração|عرض دليل الإعداد|查看设置指南
Project|Proyecto|Проект|Projet|Projekt|Projeto|المشروع|项目
Choose project|Elegir proyecto|Выберите проект|Choisir un projet|Projekt wählen|Escolher projeto|اختر مشروعًا|选择项目
Deployment history|Historial de despliegues|История развёртываний|Historique des déploiements|Bereitstellungsverlauf|Histórico de implantações|سجل النشر|部署历史
All deployments|Todos los despliegues|Все развёртывания|Tous les déploiements|Alle Bereitstellungen|Todas as implantações|كل عمليات النشر|所有部署
Production only|Solo producción|Только рабочие|Production uniquement|Nur Produktion|Somente produção|الإنتاج فقط|仅生产环境
Previews only|Solo vistas previas|Только предварительные|Aperçus uniquement|Nur Vorschauen|Somente prévias|المعاينات فقط|仅预览
Failed|Fallido|Ошибка|Échec|Fehlgeschlagen|Falhou|فشل|失败
Execution history|Historial de ejecución|История выполнения|Historique d’exécution|Ausführungsverlauf|Histórico de execução|سجل التنفيذ|执行历史
Execution output|Salida de ejecución|Результат выполнения|Sortie d’exécution|Ausgabe|Saída de execução|مخرجات التنفيذ|执行输出
Copy logs|Copiar registros|Копировать журнал|Copier les journaux|Protokolle kopieren|Copiar registros|نسخ السجلات|复制日志
Download logs|Descargar registros|Скачать журнал|Télécharger les journaux|Protokolle herunterladen|Baixar registros|تنزيل السجلات|下载日志
Connect your Firebase account|Conecta tu cuenta Firebase|Подключите аккаунт Firebase|Connectez votre compte Firebase|Firebase-Konto verbinden|Conecte sua conta Firebase|اربط حساب Firebase|连接 Firebase 账户
STEP 01 — GOOGLE ACCOUNT|PASO 01 — CUENTA GOOGLE|ШАГ 01 — АККАУНТ GOOGLE|ÉTAPE 01 — COMPTE GOOGLE|SCHRITT 01 — GOOGLE-KONTO|ETAPA 01 — CONTA GOOGLE|الخطوة 01 — حساب GOOGLE|步骤 01 — GOOGLE 账户
Connect Google Account|Conectar cuenta Google|Подключить Google|Connecter Google|Google-Konto verbinden|Conectar conta Google|ربط حساب Google|连接 Google 账户
Alternative code login|Acceso con código alternativo|Вход с кодом|Connexion par code|Alternative Code-Anmeldung|Login alternativo por código|تسجيل الدخول برمز بديل|使用验证码登录
Check connection|Comprobar conexión|Проверить подключение|Vérifier la connexion|Verbindung prüfen|Verificar conexão|فحص الاتصال|检查连接
Connected|Conectado|Подключено|Connecté|Verbunden|Conectado|متصل|已连接
Not signed in|Sin iniciar sesión|Вход не выполнен|Non connecté|Nicht angemeldet|Não conectado|لم يتم تسجيل الدخول|未登录
Checking account|Comprobando cuenta|Проверка аккаунта|Vérification du compte|Konto wird geprüft|Verificando conta|جارٍ فحص الحساب|正在检查账户
Checking connection|Comprobando conexión|Проверка подключения|Vérification de connexion|Verbindung wird geprüft|Verificando conexão|جارٍ فحص الاتصال|正在检查连接
Google account not connected|Cuenta Google no conectada|Аккаунт Google не подключён|Compte Google non connecté|Google-Konto nicht verbunden|Conta Google não conectada|حساب Google غير متصل|Google 账户未连接
Browser authorization code login|Acceso con código del navegador|Вход с кодом браузера|Connexion par code du navigateur|Anmeldung per Browser-Code|Login por código do navegador|الدخول برمز تفويض المتصفح|浏览器授权码登录
Send|Enviar|Отправить|Envoyer|Senden|Enviar|إرسال|发送
Waiting|Esperando|Ожидание|En attente|Warten|Aguardando|انتظار|等待中
Runtime health|Estado del entorno|Состояние среды|État de l’environnement|Laufzeitstatus|Estado do ambiente|حالة بيئة التشغيل|运行环境状态
Bundled Firebase CLI and local server.|Firebase CLI incluido y servidor local.|Встроенный Firebase CLI и локальный сервер.|Firebase CLI intégré et serveur local.|Enthaltene Firebase CLI und lokaler Server.|Firebase CLI incluído e servidor local.|Firebase CLI المضمّن والخادم المحلي.|内置 Firebase CLI 和本地服务器。
Local Firebase CLI|Firebase CLI local|Локальный Firebase CLI|Firebase CLI local|Lokale Firebase CLI|Firebase CLI local|Firebase CLI المحلي|本地 Firebase CLI
Installed|Instalado|Установлен|Installé|Installiert|Instalado|مثبّت|已安装
Unavailable|No disponible|Недоступно|Indisponible|Nicht verfügbar|Indisponível|غير متاح|不可用
Checking|Comprobando|Проверка|Vérification|Wird geprüft|Verificando|جارٍ الفحص|正在检查
Check setup|Revisar configuración|Проверьте настройки|Vérifier les paramètres|Einrichtung prüfen|Verificar configuração|فحص الإعداد|检查设置
Authentication method|Método de autenticación|Способ авторизации|Méthode d’authentification|Authentifizierung|Método de autenticação|طريقة المصادقة|身份验证方式
Workspace storage|Almacenamiento local|Хранилище рабочей области|Stockage local|Arbeitsbereichsspeicher|Armazenamento local|تخزين مساحة العمل|工作区存储
Backend address|Dirección del servidor|Адрес сервера|Adresse du serveur|Serveradresse|Endereço do servidor|عنوان الخادم|后端地址
Create a Firebase project|Crear un proyecto Firebase|Создать проект Firebase|Créer un projet Firebase|Firebase-Projekt erstellen|Criar projeto Firebase|إنشاء مشروع Firebase|创建 Firebase 项目
Optional: start from a brand-new Firebase project.|Opcional: empieza con un proyecto nuevo.|Необязательно: начните с нового проекта.|Facultatif : démarrez un nouveau projet.|Optional: mit einem neuen Projekt beginnen.|Opcional: comece com um novo projeto.|اختياري: ابدأ بمشروع Firebase جديد.|可选：从全新的 Firebase 项目开始。
OPTIONAL|OPCIONAL|НЕОБЯЗАТЕЛЬНО|FACULTATIF|OPTIONAL|OPCIONAL|اختياري|可选
Project display name|Nombre del proyecto|Название проекта|Nom du projet|Projektname|Nome do projeto|اسم المشروع|项目显示名称
Unique project ID|ID único del proyecto|Уникальный ID проекта|ID unique du projet|Eindeutige Projekt-ID|ID exclusivo do projeto|معرّف المشروع الفريد|唯一项目 ID
Create Firebase project|Crear proyecto Firebase|Создать проект Firebase|Créer un projet Firebase|Firebase-Projekt erstellen|Criar projeto Firebase|إنشاء مشروع Firebase|创建 Firebase 项目
Create a Firebase Hosting site|Crear un sitio Firebase Hosting|Создать сайт Firebase Hosting|Créer un site Firebase Hosting|Firebase-Hosting-Site erstellen|Criar site Firebase Hosting|إنشاء موقع Firebase Hosting|创建 Firebase Hosting 网站
Add a new website inside an existing Firebase project.|Añade un sitio a un proyecto existente.|Добавьте сайт в существующий проект.|Ajoutez un site à un projet existant.|Neue Website zu bestehendem Projekt hinzufügen.|Adicione um site a um projeto existente.|أضف موقعًا إلى مشروع Firebase موجود.|在现有 Firebase 项目中添加网站。
STEP 02|PASO 02|ШАГ 02|ÉTAPE 02|SCHRITT 02|ETAPA 02|الخطوة 02|步骤 02
Firebase project|Proyecto Firebase|Проект Firebase|Projet Firebase|Firebase-Projekt|Projeto Firebase|مشروع Firebase|Firebase 项目
New Hosting site ID|ID del nuevo sitio|ID нового сайта|ID du nouveau site|Neue Hosting-Site-ID|ID do novo site|معرّف موقع الاستضافة الجديد|新托管网站 ID
Create Hosting site|Crear sitio Hosting|Создать сайт Hosting|Créer le site Hosting|Hosting-Site erstellen|Criar site Hosting|إنشاء موقع استضافة|创建托管网站
Deploy in three steps|Desplegar en tres pasos|Публикация в три шага|Déployer en trois étapes|In drei Schritten bereitstellen|Implantar em três etapas|النشر في ثلاث خطوات|三步完成部署
WORKFLOW|FLUJO DE TRABAJO|РАБОЧИЙ ПРОЦЕСС|FLUX DE TRAVAIL|ABLAUF|FLUXO DE TRABALHO|سير العمل|工作流程
01 · Select website|01 · Seleccionar sitio|01 · Выберите сайт|01 · Choisir le site|01 · Website wählen|01 · Selecionar site|01 · اختر الموقع|01 · 选择网站
02 · Upload & preview|02 · Subir y previsualizar|02 · Загрузка и просмотр|02 · Importer et prévisualiser|02 · Hochladen und Vorschau|02 · Enviar e visualizar|02 · الرفع والمعاينة|02 · 上传与预览
03 · Deploy & monitor|03 · Desplegar y supervisar|03 · Публикация и контроль|03 · Déployer et surveiller|03 · Bereitstellen und überwachen|03 · Implantar e monitorar|03 · النشر والمراقبة|03 · 部署与监控
Upload a website build|Subir una compilación web|Загрузить сборку сайта|Importer une version du site|Website-Build hochladen|Enviar uma compilação do site|رفع إصدار موقع|上传网站构建
Hosting website|Sitio alojado|Сайт хостинга|Site hébergé|Hosting-Website|Site hospedado|موقع الاستضافة|托管网站
Website files|Archivos del sitio|Файлы сайта|Fichiers du site|Website-Dateien|Arquivos do site|ملفات الموقع|网站文件
Choose a ZIP or a build folder|Elige un ZIP o carpeta compilada|Выберите ZIP или папку сборки|Choisir un ZIP ou dossier compilé|ZIP oder Build-Ordner wählen|Escolha um ZIP ou pasta compilada|اختر ZIP أو مجلد إصدار|选择 ZIP 或构建文件夹
Select ZIP|Elegir ZIP|Выбрать ZIP|Choisir ZIP|ZIP wählen|Selecionar ZIP|اختر ZIP|选择 ZIP
Select folder|Elegir carpeta|Выбрать папку|Choisir un dossier|Ordner wählen|Selecionar pasta|اختر مجلدًا|选择文件夹
Cancel|Cancelar|Отмена|Annuler|Abbrechen|Cancelar|إلغاء|取消
Close|Cerrar|Закрыть|Fermer|Schließen|Fechar|إغلاق|关闭
Website details|Detalles del sitio|Данные сайта|Détails du site|Website-Details|Detalhes do site|تفاصيل الموقع|网站详情
Build files|Archivos compilados|Файлы сборки|Fichiers compilés|Build-Dateien|Arquivos compilados|ملفات الإصدار|构建文件
Local preview|Vista previa local|Локальный просмотр|Aperçu local|Lokale Vorschau|Prévia local|معاينة محلية|本地预览
New upload|Nueva carga|Новая загрузка|Nouvel import|Neuer Upload|Novo envio|رفع جديد|新上传
Deploy to production|Desplegar a producción|Опубликовать|Déployer en production|In Produktion bereitstellen|Implantar em produção|النشر للإنتاج|部署到生产环境
Preview|Vista previa|Предпросмотр|Aperçu|Vorschau|Prévia|معاينة|预览
Download|Descargar|Скачать|Télécharger|Herunterladen|Baixar|تنزيل|下载
View & deploy|Ver y desplegar|Просмотр и публикация|Voir et déployer|Ansehen und bereitstellen|Ver e implantar|عرض ونشر|查看并部署
Build ready|Compilación lista|Сборка готова|Version prête|Build bereit|Compilação pronta|الإصدار جاهز|构建就绪
No local build|Sin compilación local|Нет локальной сборки|Aucune version locale|Kein lokaler Build|Sem compilação local|لا يوجد إصدار محلي|无本地构建
Success|Éxito|Успешно|Réussite|Erfolgreich|Sucesso|نجاح|成功
Running|En ejecución|Выполняется|En cours|Läuft|Em execução|قيد التشغيل|运行中
Queued|En cola|В очереди|En attente|In Warteschlange|Na fila|في قائمة الانتظار|排队中
Production|Producción|Рабочая версия|Production|Produktion|Produção|الإنتاج|生产环境
Preview channel|Canal de vista previa|Канал предпросмотра|Canal d’aperçu|Vorschaukanal|Canal de prévia|قناة معاينة|预览通道
View logs →|Ver registros →|Журнал →|Voir les journaux →|Protokolle →|Ver registros →|عرض السجلات ←|查看日志 →
Ready for launch?|¿Listo para publicar?|Готовы к запуску?|Prêt à publier ?|Bereit zum Start?|Pronto para publicar?|جاهز للإطلاق؟|准备好发布了吗？
Contact PQC|Contactar PQC|Связаться с PQC|Contacter PQC|PQC kontaktieren|Contatar PQC|تواصل مع PQC|联系 PQC
Terms & conditions|Términos y condiciones|Условия использования|Conditions générales|Nutzungsbedingungen|Termos e condições|الشروط والأحكام|条款与条件
Cookie preferences|Preferencias de cookies|Настройки cookie|Préférences des cookies|Cookie-Einstellungen|Preferências de cookies|تفضيلات ملفات الارتباط|Cookie 偏好设置
Privacy & storage|Privacidad y almacenamiento|Конфиденциальность и хранение|Confidentialité et stockage|Datenschutz und Speicherung|Privacidade e armazenamento|الخصوصية والتخزين|隐私与存储
Privacy & local storage|Privacidad y almacenamiento local|Конфиденциальность и локальное хранение|Confidentialité et stockage local|Datenschutz und lokaler Speicher|Privacidade e armazenamento local|الخصوصية والتخزين المحلي|隐私与本地存储
Your privacy, your choice|Tu privacidad, tu elección|Ваша приватность — ваш выбор|Votre vie privée, votre choix|Ihre Daten, Ihre Entscheidung|Sua privacidade, sua escolha|خصوصيتك، اختيارك|您的隐私，您的选择
Privacy & storage details|Detalles de privacidad y almacenamiento|Подробности о хранении данных|Détails de confidentialité et stockage|Details zu Datenschutz und Speicher|Detalhes de privacidade e armazenamento|تفاصيل الخصوصية والتخزين|隐私与存储详情
Decline optional|Rechazar opcionales|Отклонить необязательное|Refuser les options|Optionales ablehnen|Recusar opcionais|رفض الاختياري|拒绝可选项
Accept optional|Aceptar opcionales|Принять необязательное|Accepter les options|Optionales akzeptieren|Aceitar opcionais|قبول الاختياري|接受可选项
Essential storage|Almacenamiento esencial|Необходимое хранение|Stockage essentiel|Notwendiger Speicher|Armazenamento essencial|التخزين الأساسي|必要存储
Optional external fonts|Fuentes externas opcionales|Необязательные внешние шрифты|Polices externes facultatives|Optionale externe Schriftarten|Fontes externas opcionais|خطوط خارجية اختيارية|可选外部字体
Your workspace|Tu espacio de trabajo|Ваша рабочая область|Votre espace de travail|Ihr Arbeitsbereich|Sua área de trabalho|مساحة عملك|您的工作区
Private on this computer|Privado en este equipo|Только на этом компьютере|Privé sur cet ordinateur|Privat auf diesem Computer|Privado neste computador|خاص على هذا الجهاز|仅限此计算机
Open full dashboard ✕|Abrir panel completo ✕|Открыть панель ✕|Ouvrir le tableau de bord ✕|Dashboard öffnen ✕|Abrir painel completo ✕|فتح لوحة التحكم ✕|打开完整控制面板 ✕
Put your website online.|Publica tu sitio web.|Опубликуйте свой сайт.|Publiez votre site web.|Bringen Sie Ihre Website online.|Publique seu site.|انشر موقعك على الإنترنت.|让您的网站上线。
Connect Firebase|Conectar Firebase|Подключить Firebase|Connecter Firebase|Firebase verbinden|Conectar Firebase|ربط Firebase|连接 Firebase
Select a Hosting site|Seleccionar sitio Hosting|Выберите сайт Hosting|Choisir un site Hosting|Hosting-Site wählen|Selecionar site Hosting|اختر موقع استضافة|选择托管网站
Upload and deploy|Subir y desplegar|Загрузить и опубликовать|Importer et déployer|Hochladen und bereitstellen|Enviar e implantar|الرفع والنشر|上传并部署
Secure Google sign-in|Acceso seguro con Google|Безопасный вход Google|Connexion Google sécurisée|Sichere Google-Anmeldung|Login seguro com Google|تسجيل دخول Google الآمن|安全的 Google 登录
Publish website|Publicar sitio|Опубликовать сайт|Publier le site|Website veröffentlichen|Publicar site|نشر الموقع|发布网站
Continue|Continuar|Продолжить|Continuer|Weiter|Continuar|متابعة|继续
Back|Atrás|Назад|Retour|Zurück|Voltar|رجوع|返回
Next|Siguiente|Далее|Suivant|Weiter|Próximo|التالي|下一步
Search website or project...|Buscar sitio o proyecto...|Поиск сайта или проекта...|Rechercher un site ou projet...|Website oder Projekt suchen...|Buscar site ou projeto...|ابحث عن موقع أو مشروع...|搜索网站或项目…
Search websites|Buscar sitios|Поиск сайтов|Rechercher des sites|Websites suchen|Buscar sites|البحث عن مواقع|搜索网站
Open menu|Abrir menú|Открыть меню|Ouvrir le menu|Menü öffnen|Abrir menu|فتح القائمة|打开菜单
Close menu|Cerrar menú|Закрыть меню|Fermer le menu|Menü schließen|Fechar menu|إغلاق القائمة|关闭菜单
Skip to content|Saltar al contenido|Перейти к содержимому|Aller au contenu|Zum Inhalt springen|Ir para o conteúdo|انتقل إلى المحتوى|跳转到内容
Firebase CLI ready|Firebase CLI listo|Firebase CLI готов|Firebase CLI prêt|Firebase CLI bereit|Firebase CLI pronto|Firebase CLI جاهز|Firebase CLI 已就绪
Firebase CLI connected|Firebase CLI conectado|Firebase CLI подключён|Firebase CLI connecté|Firebase CLI verbunden|Firebase CLI conectado|Firebase CLI متصل|Firebase CLI 已连接
Firebase CLI unavailable|Firebase CLI no disponible|Firebase CLI недоступен|Firebase CLI indisponible|Firebase CLI nicht verfügbar|Firebase CLI indisponível|Firebase CLI غير متاح|Firebase CLI 不可用
Checking Firebase CLI|Comprobando Firebase CLI|Проверка Firebase CLI|Vérification de Firebase CLI|Firebase CLI wird geprüft|Verificando Firebase CLI|جارٍ فحص Firebase CLI|正在检查 Firebase CLI
No projects available — connect or create one|Sin proyectos: conecta o crea uno|Нет проектов: подключите или создайте|Aucun projet : connectez-vous ou créez-en un|Keine Projekte: verbinden oder erstellen|Sem projetos: conecte ou crie um|لا توجد مشاريع — اربط حسابًا أو أنشئ مشروعًا|没有项目 — 请连接或创建
Loading projects…|Cargando proyectos…|Загрузка проектов…|Chargement des projets…|Projekte werden geladen…|Carregando projetos…|جارٍ تحميل المشاريع…|正在加载项目…
Welcome to your c-Panel|Bienvenido a tu c-Panel|Добро пожаловать в c-Panel|Bienvenue dans c-Panel|Willkommen bei c-Panel|Bem-vindo ao c-Panel|مرحبًا بك في c-Panel|欢迎使用 c-Panel
Dashboard password|Contraseña del panel|Пароль панели|Mot de passe du tableau de bord|Dashboard-Passwort|Senha do painel|كلمة مرور لوحة التحكم|控制面板密码
Unlock dashboard|Desbloquear panel|Открыть панель|Déverrouiller le tableau de bord|Dashboard entsperren|Desbloquear painel|فتح لوحة التحكم|解锁控制面板
GET STARTED|EMPEZAR|НАЧАТЬ|COMMENCER|LOSLEGEN|COMEÇAR|ابدأ|开始使用
Everything you need to publish.|Todo lo necesario para publicar.|Всё для публикации.|Tout pour publier.|Alles zum Veröffentlichen.|Tudo para publicar.|كل ما تحتاجه للنشر.|发布所需的一切。
Track all releases and preview builds.|Sigue las versiones y vistas previas.|Отслеживайте выпуски и сборки.|Suivez les versions et aperçus.|Versionen und Vorschauen verfolgen.|Acompanhe versões e prévias.|تابع الإصدارات والمعاينات.|跟踪所有版本和预览构建。
Upload a build, test it locally and deploy with one click.|Sube una versión, pruébala localmente y publícala.|Загрузите сборку, проверьте локально и опубликуйте.|Importez, testez localement et publiez.|Build hochladen, lokal testen und veröffentlichen.|Envie, teste localmente e publique.|ارفع إصدارًا واختبره محليًا ثم انشره.|上传构建，在本地测试并发布。
Install CLI and sign in on this machine.|Instala CLI e inicia sesión en este equipo.|Установите CLI и войдите на этом компьютере.|Installez CLI et connectez-vous ici.|CLI installieren und hier anmelden.|Instale CLI e entre neste computador.|ثبّت CLI وسجّل الدخول على هذا الجهاز.|安装 CLI 并在此计算机上登录。
Pick a Firebase project and website.|Elige un proyecto y sitio Firebase.|Выберите проект и сайт Firebase.|Choisissez un projet et un site Firebase.|Firebase-Projekt und Website wählen.|Escolha projeto e site Firebase.|اختر مشروع وموقع Firebase.|选择 Firebase 项目和网站。
Add a ZIP/build folder and publish it.|Añade un ZIP o carpeta y publícala.|Добавьте ZIP или папку и опубликуйте.|Ajoutez un ZIP ou dossier et publiez.|ZIP oder Build-Ordner hinzufügen und veröffentlichen.|Adicione um ZIP ou pasta e publique.|أضف ZIP أو مجلد إصدار وانشره.|添加 ZIP 或构建文件夹并发布。
No deployments yet|Aún no hay despliegues|Развёртываний пока нет|Aucun déploiement|Noch keine Bereitstellungen|Nenhuma implantação ainda|لا توجد عمليات نشر بعد|尚无部署
Your deployment history and logs will appear here after your first release.|El historial y los registros aparecerán tras tu primera publicación.|История и журналы появятся после первой публикации.|L’historique et les journaux apparaîtront après la première publication.|Nach der ersten Veröffentlichung erscheinen hier Verlauf und Protokolle.|O histórico e registros aparecerão após a primeira publicação.|سيظهر السجل بعد أول نشر.|首次发布后，这里将显示部署历史和日志。
More sites, one dashboard|Más sitios, un panel|Больше сайтов, одна панель|Plus de sites, un tableau de bord|Mehr Websites, ein Dashboard|Mais sites, um painel|مواقع أكثر، لوحة واحدة|更多网站，一个控制面板
Additional Hosting sites will automatically appear when you refresh.|Los sitios adicionales aparecerán al actualizar.|Другие сайты появятся после обновления.|Les autres sites apparaîtront après actualisation.|Weitere Websites erscheinen nach dem Aktualisieren.|Outros sites aparecerão ao atualizar.|ستظهر المواقع الإضافية عند التحديث.|刷新后将自动显示其他托管网站。
See all sites|Ver todos los sitios|Все сайты|Voir tous les sites|Alle Websites anzeigen|Ver todos os sites|عرض كل المواقع|查看所有网站
WEBSITE|SITIO WEB|САЙТ|SITE WEB|WEBSITE|SITE|الموقع|网站
TYPE|TIPO|ТИП|TYPE|TYP|TIPO|النوع|类型
STATUS|ESTADO|СТАТУС|ÉTAT|STATUS|STATUS|الحالة|状态
STARTED|INICIO|НАЧАЛО|DÉBUT|GESTARTET|INÍCIO|البدء|开始时间
FINISHED|FIN|ЗАВЕРШЕНИЕ|FIN|BEENDET|FIM|الانتهاء|完成时间
DETAILS|DETALLES|ПОДРОБНОСТИ|DÉTAILS|DETAILS|DETALHES|التفاصيل|详情
Every release started from this dashboard.|Cada versión iniciada desde este panel.|Все выпуски, запущенные с этой панели.|Chaque version lancée depuis ce tableau de bord.|Jede hier gestartete Veröffentlichung.|Cada versão iniciada neste painel.|كل إصدار بدأ من هذه اللوحة.|从此控制面板启动的每次发布。
Select a task to read its output.|Elige una tarea para ver su salida.|Выберите задачу для просмотра вывода.|Choisissez une tâche pour voir sa sortie.|Aufgabe wählen, um die Ausgabe zu sehen.|Escolha uma tarefa para ver a saída.|اختر مهمة لعرض مخرجاتها.|选择任务以查看其输出。
History|Historial|История|Historique|Verlauf|Histórico|السجل|历史记录
Download live ZIP|Descargar ZIP publicado|Скачать ZIP сайта|Télécharger le ZIP publié|Live-ZIP herunterladen|Baixar ZIP publicado|تنزيل ZIP المنشور|下载线上 ZIP
Download uploaded ZIP|Descargar ZIP subido|Скачать загруженный ZIP|Télécharger le ZIP importé|Hochgeladenes ZIP herunterladen|Baixar ZIP enviado|تنزيل ZIP المرفوع|下载已上传的 ZIP
Download live website ZIP|Descargar ZIP del sitio publicado|Скачать ZIP опубликованного сайта|Télécharger le ZIP du site publié|ZIP der Live-Website herunterladen|Baixar ZIP do site publicado|تنزيل ZIP الموقع المنشور|下载线上网站 ZIP
Publish this website?|¿Publicar este sitio?|Опубликовать этот сайт?|Publier ce site ?|Diese Website veröffentlichen?|Publicar este site?|نشر هذا الموقع؟|发布此网站？
This action updates your live Firebase Hosting site.|Esta acción actualiza tu sitio publicado.|Это обновит ваш опубликованный сайт.|Cette action met à jour votre site publié.|Dies aktualisiert Ihre Live-Website.|Esta ação atualiza seu site publicado.|سيؤدي هذا إلى تحديث موقعك المنشور.|此操作会更新您的线上 Firebase Hosting 网站。
Yes, deploy now|Sí, desplegar ahora|Да, опубликовать|Oui, déployer|Ja, jetzt bereitstellen|Sim, implantar agora|نعم، انشر الآن|是，立即部署
Single-page application (SPA)|Aplicación de página única (SPA)|Одностраничное приложение (SPA)|Application monopage (SPA)|Single-Page-Anwendung (SPA)|Aplicativo de página única (SPA)|تطبيق أحادي الصفحة (SPA)|单页应用（SPA）
START HERE · NO CODING REQUIRED|EMPIEZA AQUÍ · SIN PROGRAMAR|НАЧНИТЕ ЗДЕСЬ · БЕЗ КОДА|COMMENCEZ ICI · SANS CODE|HIER STARTEN · OHNE CODE|COMECE AQUI · SEM CÓDIGO|ابدأ هنا · دون برمجة|从这里开始 · 无需编程
A simple 4-step guide. You don't need to type terminal commands or know how Firebase works.|Una guía de 4 pasos, sin comandos ni conocimientos de Firebase.|Простое руководство из 4 шагов, без команд и знаний Firebase.|Un guide en 4 étapes, sans commandes ni connaissances Firebase.|Eine Anleitung in 4 Schritten, ohne Befehle oder Firebase-Kenntnisse.|Um guia de 4 etapas, sem comandos ou conhecimento de Firebase.|دليل من 4 خطوات دون أوامر أو معرفة مسبقة بـ Firebase.|简单的四步指南，无需终端命令或 Firebase 知识。
Connect Google|Conectar Google|Подключить Google|Connecter Google|Google verbinden|Conectar Google|ربط Google|连接 Google
Authorize your Firebase account|Autoriza tu cuenta Firebase|Авторизуйте аккаунт Firebase|Autorisez votre compte Firebase|Firebase-Konto autorisieren|Autorize sua conta Firebase|فوّض حساب Firebase|授权您的 Firebase 账户
Choose website|Elegir sitio|Выбрать сайт|Choisir le site|Website wählen|Escolher site|اختر الموقع|选择网站
Pick where to publish|Elige dónde publicar|Выберите место публикации|Choisissez où publier|Veröffentlichungsziel wählen|Escolha onde publicar|اختر مكان النشر|选择发布位置
Upload files|Subir archivos|Загрузить файлы|Importer les fichiers|Dateien hochladen|Enviar arquivos|رفع الملفات|上传文件
ZIP or website folder|ZIP o carpeta del sitio|ZIP или папка сайта|ZIP ou dossier du site|ZIP oder Website-Ordner|ZIP ou pasta do site|ZIP أو مجلد الموقع|ZIP 或网站文件夹
Preview & publish|Previsualizar y publicar|Просмотр и публикация|Prévisualiser et publier|Vorschau und Veröffentlichung|Visualizar e publicar|معاينة ونشر|预览与发布
Review before going live|Revisa antes de publicar|Проверьте перед публикацией|Vérifiez avant de publier|Vor Veröffentlichung prüfen|Revise antes de publicar|راجع قبل النشر|上线前审核
What happens to my old website?|¿Qué pasa con mi sitio anterior?|Что будет со старым сайтом?|Que devient mon ancien site ?|Was passiert mit meiner alten Website?|O que acontece com meu site antigo?|ماذا يحدث لموقعي القديم؟|我的旧网站会怎样？
Nothing changes until you approve|Nada cambia hasta que apruebes|Ничего не меняется до вашего согласия|Rien ne change sans votre accord|Ohne Ihre Freigabe ändert sich nichts|Nada muda até você aprovar|لا يتغير شيء حتى توافق|您批准前不会有任何更改
. Only the website you select is updated.|. Solo se actualiza el sitio elegido.|. Обновляется только выбранный сайт.|. Seul le site choisi est mis à jour.|. Nur die gewählte Website wird aktualisiert.|. Apenas o site escolhido é atualizado.|. يُحدّث الموقع المحدد فقط.|。仅更新所选网站。
Learn about Firebase Hosting ↗|Más sobre Firebase Hosting ↗|О Firebase Hosting ↗|Découvrir Firebase Hosting ↗|Über Firebase Hosting ↗|Sobre Firebase Hosting ↗|تعرّف على Firebase Hosting ↗|了解 Firebase Hosting ↗
STEP 1 OF 4|PASO 1 DE 4|ШАГ 1 ИЗ 4|ÉTAPE 1 SUR 4|SCHRITT 1 VON 4|ETAPA 1 DE 4|الخطوة 1 من 4|第 1 步，共 4 步
STEP 2 OF 4|PASO 2 DE 4|ШАГ 2 ИЗ 4|ÉTAPE 2 SUR 4|SCHRITT 2 VON 4|ETAPA 2 DE 4|الخطوة 2 من 4|第 2 步，共 4 步
STEP 3 OF 4|PASO 3 DE 4|ШАГ 3 ИЗ 4|ÉTAPE 3 SUR 4|SCHRITT 3 VON 4|ETAPA 3 DE 4|الخطوة 3 من 4|第 3 步，共 4 步
STEP 4 OF 4|PASO 4 DE 4|ШАГ 4 ИЗ 4|ÉTAPE 4 SUR 4|SCHRITT 4 VON 4|ETAPA 4 DE 4|الخطوة 4 من 4|第 4 步，共 4 步
Connect your Google account|Conecta tu cuenta Google|Подключите аккаунт Google|Connectez votre compte Google|Google-Konto verbinden|Conecte sua conta Google|اربط حساب Google|连接您的 Google 账户
We'll find all websites in your Firebase account automatically.|Encontraremos tus sitios Firebase automáticamente.|Мы автоматически найдём сайты вашего аккаунта Firebase.|Nous trouverons vos sites Firebase automatiquement.|Wir finden Ihre Firebase-Websites automatisch.|Encontraremos seus sites Firebase automaticamente.|سنجد مواقع حساب Firebase تلقائيًا.|我们会自动查找您 Firebase 账户中的所有网站。
Sign in with Google|Iniciar sesión con Google|Войти через Google|Se connecter avec Google|Mit Google anmelden|Entrar com Google|تسجيل الدخول عبر Google|使用 Google 登录
Where should your website go?|¿Dónde publicar tu sitio?|Где разместить ваш сайт?|Où publier votre site ?|Wo soll Ihre Website erscheinen?|Onde publicar seu site?|أين تريد نشر موقعك؟|您的网站应发布在哪里？
Select your existing website. If this is your first one, create it here.|Elige tu sitio existente o crea el primero aquí.|Выберите существующий сайт или создайте первый.|Choisissez votre site ou créez le premier ici.|Bestehende Website wählen oder hier die erste erstellen.|Escolha seu site ou crie o primeiro aqui.|اختر موقعك الحالي أو أنشئ أول موقع هنا.|选择现有网站，或在此创建您的第一个网站。
Google account connected|Cuenta Google conectada|Аккаунт Google подключён|Compte Google connecté|Google-Konto verbunden|Conta Google conectada|حساب Google متصل|Google 账户已连接
Website to update|Sitio a actualizar|Сайт для обновления|Site à mettre à jour|Zu aktualisierende Website|Site a atualizar|الموقع المطلوب تحديثه|要更新的网站
Choose your website|Elige tu sitio|Выберите ваш сайт|Choisissez votre site|Ihre Website wählen|Escolha seu site|اختر موقعك|选择您的网站
Selected website|Sitio seleccionado|Выбранный сайт|Site sélectionné|Gewählte Website|Site selecionado|الموقع المحدد|所选网站
This is your existing live website|Este es tu sitio publicado actual|Это ваш опубликованный сайт|Voici votre site publié actuel|Dies ist Ihre aktuelle Live-Website|Este é seu site publicado atual|هذا هو موقعك المنشور الحالي|这是您当前的线上网站
Open live ↗|Abrir sitio ↗|Открыть сайт ↗|Ouvrir le site ↗|Live öffnen ↗|Abrir site ↗|فتح الموقع ↗|打开线上网站 ↗
Continue to upload|Continuar a la carga|Перейти к загрузке|Continuer vers l’import|Weiter zum Upload|Continuar para envio|متابعة للرفع|继续上传
Refresh websites|Actualizar sitios|Обновить сайты|Actualiser les sites|Websites aktualisieren|Atualizar sites|تحديث المواقع|刷新网站
Create a new Firebase project|Crear un proyecto Firebase nuevo|Создать новый проект Firebase|Créer un nouveau projet Firebase|Neues Firebase-Projekt erstellen|Criar novo projeto Firebase|إنشاء مشروع Firebase جديد|创建新的 Firebase 项目
Project name|Nombre del proyecto|Название проекта|Nom du projet|Projektname|Nome do projeto|اسم المشروع|项目名称
Create project|Crear proyecto|Создать проект|Créer le projet|Projekt erstellen|Criar projeto|إنشاء مشروع|创建项目
Create a Hosting website inside the selected project|Crear un sitio en el proyecto seleccionado|Создать сайт в выбранном проекте|Créer un site dans le projet choisi|Website im gewählten Projekt erstellen|Criar site no projeto selecionado|إنشاء موقع في المشروع المحدد|在所选项目中创建托管网站
Unique website name|Nombre único del sitio|Уникальное имя сайта|Nom unique du site|Eindeutiger Website-Name|Nome exclusivo do site|اسم موقع فريد|唯一网站名称
Create website|Crear sitio|Создать сайт|Créer le site|Website erstellen|Criar site|إنشاء موقع|创建网站
No website listed?|¿No aparece tu sitio?|Нет сайтов в списке?|Aucun site affiché ?|Keine Website aufgeführt?|Nenhum site listado?|لا يوجد موقع؟|没有列出网站？
Create a new website|Crear un sitio nuevo|Создать новый сайт|Créer un nouveau site|Neue Website erstellen|Criar novo site|إنشاء موقع جديد|创建新网站
Create a new project|Crear un proyecto nuevo|Создать новый проект|Créer un nouveau projet|Neues Projekt erstellen|Criar novo projeto|إنشاء مشروع جديد|创建新项目
← Back|← Atrás|← Назад|← Retour|← Zurück|← Voltar|رجوع →|← 返回
Your choice won't change other websites.|Tu elección no cambia otros sitios.|Ваш выбор не изменит другие сайты.|Votre choix ne modifie pas les autres sites.|Ihre Auswahl ändert keine anderen Websites.|Sua escolha não altera outros sites.|اختيارك لا يغيّر المواقع الأخرى.|您的选择不会更改其他网站。
Upload your latest website|Sube tu última versión|Загрузите новую версию сайта|Importez votre dernière version|Neueste Website-Version hochladen|Envie sua versão mais recente|ارفع أحدث نسخة من موقعك|上传最新网站
Website destination|Destino del sitio|Целевой сайт|Destination du site|Website-Ziel|Destino do site|وجهة الموقع|网站目标位置
Files are uploaded locally first; not published yet|Los archivos se guardan localmente; aún no se publican|Файлы сначала загружаются локально, без публикации|Les fichiers sont d’abord importés localement|Dateien werden zunächst nur lokal hochgeladen|Arquivos enviados localmente; ainda não publicados|تُرفع الملفات محليًا أولًا دون نشر|文件先上传到本地，尚未发布
Safe staging|Preparación segura|Безопасная подготовка|Préparation sécurisée|Sichere Vorbereitung|Preparação segura|تجهيز آمن|安全暂存
Choose your website files|Elige los archivos del sitio|Выберите файлы сайта|Choisissez les fichiers du site|Website-Dateien wählen|Escolha os arquivos do site|اختر ملفات موقعك|选择网站文件
Choose ZIP|Elegir ZIP|Выбрать ZIP|Choisir ZIP|ZIP wählen|Escolher ZIP|اختر ZIP|选择 ZIP
Choose folder|Elegir carpeta|Выбрать папку|Choisir un dossier|Ordner wählen|Escolher pasta|اختر مجلدًا|选择文件夹
Ready to upload|Listo para subir|Готово к загрузке|Prêt à importer|Bereit zum Hochladen|Pronto para enviar|جاهز للرفع|准备上传
Upload website files|Subir archivos del sitio|Загрузить файлы сайта|Importer les fichiers du site|Website-Dateien hochladen|Enviar arquivos do site|رفع ملفات الموقع|上传网站文件
Use already uploaded build|Usar la versión ya subida|Использовать загруженную сборку|Utiliser la version déjà importée|Bereits hochgeladenen Build nutzen|Usar compilação já enviada|استخدام الإصدار المرفوع|使用已上传的构建
← Change website|← Cambiar sitio|← Сменить сайт|← Changer de site|← Website ändern|← Alterar site|تغيير الموقع →|← 更改网站
Your live site remains unchanged.|Tu sitio publicado no cambia.|Опубликованный сайт не меняется.|Votre site publié reste inchangé.|Ihre Live-Website bleibt unverändert.|Seu site publicado permanece igual.|موقعك المنشور يبقى دون تغيير.|您的线上网站保持不变。
Check and publish|Revisar y publicar|Проверить и опубликовать|Vérifier et publier|Prüfen und veröffentlichen|Verificar e publicar|راجع وانشر|检查并发布
Preview the uploaded website, then approve the live update.|Previsualiza el sitio y aprueba la actualización.|Проверьте сайт и подтвердите обновление.|Prévisualisez le site puis approuvez la mise à jour.|Website ansehen und Live-Update freigeben.|Visualize o site e aprove a atualização.|عاين الموقع ثم وافق على تحديثه.|预览已上传网站，然后批准线上更新。
Selected live website|Sitio publicado seleccionado|Выбранный опубликованный сайт|Site publié sélectionné|Gewählte Live-Website|Site publicado selecionado|الموقع المنشور المحدد|所选线上网站
Open local preview|Abrir vista previa local|Открыть локальный просмотр|Ouvrir l’aperçu local|Lokale Vorschau öffnen|Abrir prévia local|فتح المعاينة المحلية|打开本地预览
Make a shareable test link|Crear enlace de prueba compartible|Создать ссылку для тестирования|Créer un lien de test partageable|Teilbaren Testlink erstellen|Criar link de teste compartilhável|إنشاء رابط اختبار قابل للمشاركة|创建可分享的测试链接
Publish changes the live website.|Publicar cambia el sitio en línea.|Публикация изменяет рабочий сайт.|La publication modifie le site en ligne.|Veröffentlichen ändert die Live-Website.|Publicar altera o site em produção.|النشر يغيّر الموقع المباشر.|发布会更改线上网站。
It replaces files for the selected site only. Other Firebase websites are not updated.|Solo reemplaza archivos del sitio elegido. Los demás sitios no cambian.|Заменяются файлы только выбранного сайта. Остальные сайты не меняются.|Seuls les fichiers du site choisi sont remplacés. Les autres sites restent inchangés.|Nur Dateien der gewählten Website werden ersetzt. Andere Websites bleiben unverändert.|Substitui apenas os arquivos do site escolhido. Outros sites não mudam.|يستبدل ملفات الموقع المحدد فقط ولا يغيّر المواقع الأخرى.|仅替换所选网站的文件，不更新其他 Firebase 网站。
Waiting for deployment…|Esperando despliegue…|Ожидание развёртывания…|En attente du déploiement…|Warten auf Bereitstellung…|Aguardando implantação…|بانتظار النشر…|等待部署…
Open live website ↗|Abrir sitio publicado ↗|Открыть опубликованный сайт ↗|Ouvrir le site publié ↗|Live-Website öffnen ↗|Abrir site publicado ↗|فتح الموقع المنشور ↗|打开线上网站 ↗
View deployment details|Ver detalles del despliegue|Подробности развёртывания|Voir les détails du déploiement|Bereitstellungsdetails ansehen|Ver detalhes da implantação|عرض تفاصيل النشر|查看部署详情
← Replace uploaded files|← Reemplazar archivos subidos|← Заменить загруженные файлы|← Remplacer les fichiers importés|← Hochgeladene Dateien ersetzen|← Substituir arquivos enviados|استبدال الملفات المرفوعة →|← 替换已上传文件
Publishing needs your confirmation.|Publicar requiere tu confirmación.|Публикация требует подтверждения.|La publication nécessite votre confirmation.|Veröffentlichen erfordert Ihre Bestätigung.|A publicação exige sua confirmação.|النشر يتطلب تأكيدك.|发布需要您确认。
Select a project|Selecciona un proyecto|Выберите проект|Choisissez un projet|Projekt auswählen|Selecione um projeto|اختر مشروعًا|选择项目
Select a website|Selecciona un sitio|Выберите сайт|Choisissez un site|Website auswählen|Selecione um site|اختر موقعًا|选择网站
Sign in using your browser|Inicia sesión en el navegador|Войдите через браузер|Connectez-vous dans le navigateur|Im Browser anmelden|Entre pelo navegador|سجّل الدخول عبر المتصفح|使用浏览器登录
Start browser sign-in|Iniciar acceso en navegador|Начать вход в браузере|Démarrer la connexion navigateur|Browser-Anmeldung starten|Iniciar login no navegador|بدء تسجيل الدخول بالمتصفح|开始浏览器登录
Open Google login ↗|Abrir acceso Google ↗|Открыть вход Google ↗|Ouvrir la connexion Google ↗|Google-Anmeldung öffnen ↗|Abrir login Google ↗|فتح تسجيل دخول Google ↗|打开 Google 登录 ↗
Complete sign-in|Completar acceso|Завершить вход|Terminer la connexion|Anmeldung abschließen|Concluir login|إكمال تسجيل الدخول|完成登录
Google password is never entered here.|Nunca introduces aquí tu contraseña Google.|Пароль Google здесь не вводится.|Le mot de passe Google n’est jamais saisi ici.|Das Google-Passwort wird hier nie eingegeben.|A senha Google nunca é inserida aqui.|لا تُدخل كلمة مرور Google هنا أبدًا.|无需在此输入 Google 密码。
Technical details (optional)|Detalles técnicos (opcional)|Технические детали (необязательно)|Détails techniques (facultatif)|Technische Details (optional)|Detalhes técnicos (opcional)|تفاصيل تقنية (اختياري)|技术详情（可选）
No Firebase password needed|No necesitas contraseña Firebase|Пароль Firebase не нужен|Aucun mot de passe Firebase requis|Kein Firebase-Passwort nötig|Sem necessidade de senha Firebase|لا تحتاج كلمة مرور Firebase|无需 Firebase 密码
Ready|Listo|Готово|Prêt|Bereit|Pronto|جاهز|就绪
Use the official Firebase CLI Google sign-in. No global Firebase command or copied secret keys are required.|Usa el acceso oficial de Google de Firebase CLI. No se necesita un comando global ni copiar claves secretas.|Используйте официальный вход Google через Firebase CLI. Глобальная установка и копирование секретных ключей не нужны.|Utilisez la connexion Google officielle de Firebase CLI. Aucune commande globale ni copie de clés secrètes nécessaire.|Nutzen Sie die offizielle Google-Anmeldung der Firebase CLI. Kein globaler Befehl oder Kopieren geheimer Schlüssel nötig.|Use o login oficial Google do Firebase CLI. Não é necessário comando global nem copiar chaves secretas.|استخدم تسجيل الدخول الرسمي عبر Firebase CLI. لا تحتاج أمرًا عامًا أو نسخ مفاتيح سرية.|使用 Firebase CLI 的官方 Google 登录，无需全局 Firebase 命令或复制密钥。
6–30 lowercase letters, digits and hyphens. Start with a letter and end with a letter or digit. Cannot be changed later.|6–30 letras minúsculas, números y guiones. Empieza con una letra y termina con letra o número. No se puede cambiar después.|6–30 строчных букв, цифр и дефисов. Начните с буквы, закончите буквой или цифрой. Позже изменить нельзя.|6 à 30 lettres minuscules, chiffres et tirets. Commencez par une lettre, terminez par une lettre ou un chiffre. Non modifiable ensuite.|6–30 Kleinbuchstaben, Ziffern und Bindestriche. Mit Buchstaben beginnen, mit Buchstaben oder Ziffer enden. Später nicht änderbar.|6–30 letras minúsculas, dígitos e hífens. Comece com letra e termine com letra ou dígito. Não pode ser alterado depois.|من 6 إلى 30 حرفًا لاتينيًا صغيرًا أو رقمًا أو شرطة. يبدأ بحرف وينتهي بحرف أو رقم. لا يمكن تغييره لاحقًا.|6–30 个小写字母、数字和连字符。以字母开头，以字母或数字结尾。创建后无法更改。
2–30 lowercase letters, digits or hyphens. Start and end with a letter or digit. Must be globally unique.|2–30 letras minúsculas, números o guiones. Empieza y termina con letra o número. Debe ser único globalmente.|2–30 строчных букв, цифр или дефисов. Начало и конец — буква или цифра. Имя должно быть глобально уникальным.|2 à 30 lettres minuscules, chiffres ou tirets. Commencez et terminez par une lettre ou un chiffre. Doit être unique mondialement.|2–30 Kleinbuchstaben, Ziffern oder Bindestriche. Anfang und Ende müssen Buchstabe oder Ziffer sein. Muss weltweit eindeutig sein.|2–30 letras minúsculas, dígitos ou hífens. Comece e termine com letra ou dígito. Deve ser globalmente exclusivo.|من 2 إلى 30 حرفًا لاتينيًا صغيرًا أو رقمًا أو شرطة. يبدأ وينتهي بحرف أو رقم، ويجب أن يكون فريدًا عالميًا.|2–30 个小写字母、数字或连字符。以字母或数字开头和结尾，必须全局唯一。
Creates a real Firebase project in your Google account (subject to permissions, quotas and Google terms). You can also use an existing project instead.|Crea un proyecto real en tu cuenta Google, sujeto a permisos, cuotas y condiciones de Google. También puedes usar uno existente.|Создаёт реальный проект в аккаунте Google с учётом прав, квот и условий Google. Можно использовать существующий проект.|Crée un vrai projet dans votre compte Google, selon les autorisations, quotas et conditions Google. Vous pouvez aussi utiliser un projet existant.|Erstellt ein echtes Projekt in Ihrem Google-Konto gemäß Berechtigungen, Kontingenten und Google-Bedingungen. Sie können auch ein bestehendes Projekt nutzen.|Cria um projeto real na conta Google, sujeito a permissões, cotas e termos do Google. Você também pode usar um projeto existente.|ينشئ مشروعًا فعليًا في حساب Google وفق الصلاحيات والحصص والشروط. يمكنك استخدام مشروع موجود بدلًا من ذلك.|在您的 Google 账户中创建真实项目，受权限、配额和 Google 条款限制。您也可以使用现有项目。
Creates an actual Firebase Hosting site with a|Crea un sitio real de Firebase Hosting con una URL|Создаёт реальный сайт Firebase Hosting с адресом|Crée un vrai site Firebase Hosting avec une adresse|Erstellt eine echte Firebase-Hosting-Site mit einer|Cria um site real Firebase Hosting com uma URL|ينشئ موقع Firebase Hosting فعليًا بعنوان|创建真实的 Firebase Hosting 网站，其网址为
URL. You need permission to create sites in the project.|. Necesitas permiso para crear sitios en el proyecto.|. Нужны права на создание сайтов в проекте.|. L’autorisation de créer des sites dans le projet est requise.|-URL. Sie benötigen die Berechtigung, Websites im Projekt zu erstellen.|. Você precisa de permissão para criar sites no projeto.|. تحتاج صلاحية إنشاء المواقع في المشروع.|。您需要在该项目中创建网站的权限。
All deployments run on the local backend, with searchable logs.|Los despliegues se ejecutan localmente con registros consultables.|Развёртывания выполняются локально с журналами для поиска.|Les déploiements s’exécutent localement avec des journaux consultables.|Bereitstellungen laufen lokal mit durchsuchbaren Protokollen.|As implantações executam localmente com registros pesquisáveis.|تعمل عمليات النشر محليًا مع سجلات قابلة للبحث.|所有部署均在本地后端执行，并提供可搜索的日志。
Connect your Google account, choose project and Hosting site, or create a new site.|Conecta Google y elige un proyecto y sitio, o crea uno nuevo.|Подключите Google, выберите проект и сайт или создайте новый.|Connectez Google, choisissez un projet et un site ou créez-en un.|Google verbinden, Projekt und Website wählen oder neu erstellen.|Conecte Google, escolha projeto e site ou crie um novo.|اربط Google واختر مشروعًا وموقعًا أو أنشئ موقعًا جديدًا.|连接 Google 账户，选择项目和网站，或创建新网站。
Upload your built website ZIP or folder. Open the local sandbox preview or deploy a preview channel.|Sube un ZIP o carpeta compilada. Usa la vista previa local o un canal de prueba.|Загрузите ZIP или папку сборки. Откройте локальный просмотр или канал предпросмотра.|Importez un ZIP ou dossier compilé. Ouvrez l’aperçu local ou déployez un canal d’aperçu.|ZIP oder Build-Ordner hochladen. Lokale Vorschau öffnen oder Vorschaukanal bereitstellen.|Envie ZIP ou pasta compilada. Abra a prévia local ou publique um canal de prévia.|ارفع ZIP أو مجلد الموقع الجاهز، ثم افتح المعاينة المحلية أو قناة معاينة.|上传构建好的 ZIP 或文件夹，打开本地沙盒预览或部署预览通道。
Confirm the production site before publishing. Watch real-time Firebase output and saved error logs.|Confirma el sitio antes de publicar. Consulta la salida y los errores de Firebase.|Подтвердите рабочий сайт перед публикацией. Следите за выводом Firebase и ошибками.|Confirmez le site avant publication. Consultez la sortie Firebase et les erreurs.|Produktionswebsite bestätigen. Firebase-Ausgabe und gespeicherte Fehler verfolgen.|Confirme o site antes de publicar. Veja saída Firebase e erros salvos.|أكّد موقع الإنتاج قبل النشر وتابع مخرجات Firebase والأخطاء.|发布前确认生产网站。查看实时 Firebase 输出和保存的错误日志。
Click Connect Google Account to authorize access.|Haz clic en Conectar cuenta Google para autorizar.|Нажмите «Подключить Google» для авторизации.|Cliquez sur Connecter Google pour autoriser l’accès.|Klicken Sie zum Autorisieren auf Google-Konto verbinden.|Clique em Conectar conta Google para autorizar.|اضغط ربط حساب Google لتفويض الوصول.|点击“连接 Google 账户”以授权访问。
Firebase CLI credentials are saved by Firebase on this machine.|Firebase guarda las credenciales CLI en este equipo.|Firebase хранит данные доступа CLI на этом компьютере.|Firebase enregistre les identifiants CLI sur cet ordinateur.|Firebase speichert CLI-Zugangsdaten auf diesem Computer.|O Firebase salva as credenciais CLI neste computador.|يحفظ Firebase بيانات اعتماد CLI على هذا الجهاز.|Firebase 在此计算机上保存 CLI 凭据。
Checking Google account…|Comprobando cuenta Google…|Проверка аккаунта Google…|Vérification du compte Google…|Google-Konto wird geprüft…|Verificando conta Google…|جارٍ فحص حساب Google…|正在检查 Google 账户…
Your browser will ask you to approve access.|Tu navegador pedirá autorizar el acceso.|Браузер запросит разрешение доступа.|Votre navigateur demandera votre autorisation.|Ihr Browser bittet um Freigabe.|Seu navegador pedirá autorização.|سيطلب متصفحك الموافقة على الوصول.|浏览器会请求您批准访问。
Checking connection…|Comprobando conexión…|Проверка подключения…|Vérification de connexion…|Verbindung wird geprüft…|Verificando conexão…|جارٍ فحص الاتصال…|正在检查连接…
Checking installation...|Comprobando instalación...|Проверка установки...|Vérification de l’installation...|Installation wird geprüft...|Verificando instalação...|جارٍ فحص التثبيت...|正在检查安装…
Checking configuration...|Comprobando configuración...|Проверка конфигурации...|Vérification de la configuration...|Konfiguration wird geprüft...|Verificando configuração...|جارٍ فحص الإعدادات...|正在检查配置…
Local filesystem|Sistema de archivos local|Локальная файловая система|Système de fichiers local|Lokales Dateisystem|Sistema de arquivos local|نظام الملفات المحلي|本地文件系统
Connect Google first|Conecta Google primero|Сначала подключите Google|Connectez Google d’abord|Zuerst Google verbinden|Conecte Google primeiro|اربط Google أولًا|请先连接 Google
Loading your projects…|Cargando tus proyectos…|Загрузка ваших проектов…|Chargement de vos projets…|Ihre Projekte werden geladen…|Carregando seus projetos…|جارٍ تحميل مشاريعك…|正在加载您的项目…
Your address will be https://WEBSITE-NAME.web.app|Tu dirección será https://WEBSITE-NAME.web.app|Ваш адрес: https://WEBSITE-NAME.web.app|Votre adresse sera https://WEBSITE-NAME.web.app|Ihre Adresse lautet https://WEBSITE-NAME.web.app|Seu endereço será https://WEBSITE-NAME.web.app|سيكون عنوانك https://WEBSITE-NAME.web.app|您的地址为 https://WEBSITE-NAME.web.app
We use essential storage to remember this choice and keep protected sessions signed in. Accept to load optional Google Fonts; decline to use device fonts. No analytics or advertising trackers are installed.|Usamos almacenamiento esencial para recordar tu elección y mantener la sesión. Acepta para cargar Google Fonts opcional o rechaza para usar fuentes del dispositivo. No hay rastreadores de analítica ni publicidad.|Необходимое хранилище запоминает выбор и сохраняет вход. Примите для загрузки Google Fonts или отклоните для использования шрифтов устройства. Аналитических и рекламных трекеров нет.|Le stockage essentiel mémorise votre choix et maintient la connexion. Acceptez pour charger Google Fonts ou refusez pour utiliser les polices locales. Aucun suivi analytique ou publicitaire.|Notwendiger Speicher merkt sich Ihre Wahl und hält Sitzungen angemeldet. Akzeptieren lädt Google Fonts; Ablehnen nutzt Geräteschriftarten. Keine Analyse- oder Werbetracker.|O armazenamento essencial lembra sua escolha e mantém a sessão. Aceite para carregar Google Fonts ou recuse para usar fontes do dispositivo. Não há rastreadores de análise ou publicidade.|نستخدم التخزين الأساسي لحفظ اختيارك وإبقاء الجلسات متصلة. اقبل لتحميل Google Fonts الاختيارية أو ارفض لاستخدام خطوط الجهاز. لا توجد أدوات تتبع تحليلية أو إعلانية.|必要存储用于记住您的选择并保持受保护会话登录。接受以加载可选 Google Fonts，拒绝则使用设备字体。未安装分析或广告跟踪器。
Change your choice at any time using Cookie preferences in the footer.|Cambia tu elección en Preferencias de cookies del pie de página.|Измените выбор в настройках cookie внизу страницы.|Modifiez votre choix dans les préférences des cookies en bas de page.|Ändern Sie Ihre Wahl jederzeit über die Cookie-Einstellungen unten.|Altere sua escolha nas Preferências de cookies no rodapé.|غيّر اختيارك من تفضيلات ملفات الارتباط أسفل الصفحة.|随时通过页脚中的 Cookie 偏好设置更改选择。
This dashboard is password protected. Enter your server's access password to continue.|Este panel está protegido. Introduce la contraseña de acceso al servidor.|Панель защищена паролем. Введите пароль доступа сервера.|Ce tableau de bord est protégé. Saisissez le mot de passe du serveur.|Dieses Dashboard ist geschützt. Geben Sie das Serverpasswort ein.|Este painel é protegido. Digite a senha de acesso do servidor.|هذه اللوحة محمية. أدخل كلمة مرور الخادم للمتابعة.|此控制面板受密码保护。请输入服务器访问密码以继续。
Terms & conditions|Términos y condiciones|Условия использования|Conditions d’utilisation|Geschäftsbedingungen|Termos e condições|الشروط والأحكام|条款与条件`;
  const languages=['en','es','ru','fr','de','pt','ar','zh'];
  const dictionary=Object.fromEntries(languages.map(language=>[language,{}]));
  for(const row of rows.split('\n')) {
    const columns=row.split('|');
    if(columns.length!==languages.length)throw new Error('Invalid translation row: '+columns[0]);
    languages.forEach((language,index)=>{dictionary[language][columns[0]]=columns[index];});
  }
  window.PQCTranslations=dictionary;
})();
