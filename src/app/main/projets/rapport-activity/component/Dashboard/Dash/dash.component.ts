import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Tache } from '../../../models/Planning/Tache';
import { TacheService } from '../../../services/Planning/Tache/tache.service';
import { SrManagerService } from '../../../../sr-manager.service';
import { environment } from '../../../../../../../environments/environment';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Chart, ChartConfiguration, ChartData, ChartOptions, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {Statut} from '../../../../../../../@core/enum/RA-Enums/Statut';

// Register Chart.js components and ChartDataLabels
Chart.register(...registerables, ChartDataLabels);

@Component({
    selector: 'app-dashboard',
    templateUrl: './dash.component.html',
    styleUrls: ['./dash.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('countUp', [
            state('start', style({ opacity: 1 })),
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class DashboardComponent implements OnInit, OnDestroy {
    totalTachesGlobales = 0;
    completedTaches = 0;
    pendingTaches = 0;
    enCoursTaches = 0;
    annuleTaches = 0;
    overdueTaches = 0;
    resourceStats = {
        engin: { count: 0, unique: 0, activeTasks: 0, utilizationRate: 0 },
        mainOeuvre: { totalHours: 0, avgHoursPerTask: 0, activeWorkers: 0, uniqueWorkers: 0, utilizationRate: 0 },
        lot: { count: 0, completionRate: 0, totalLots: 0 },
        article: { count: 0, totalArticles: 0, usageRate: 0 }
    };
    tachesByMonth: { month: string, nouvelles: number, terminees: number, enCours: number, enAttente: number, enRetard: number }[] = [];
    statusDistribution = { termine: 0, enCours: 0, enAttente: 0, annule: 0, enRetard: 0 };
    recentTasks: Tache[] = [];
    filteredTasks: Tache[] = [];
    currentFilter: string = 'Toutes';
    selectedAffaire: string = 'Toutes';
    affaires: string[] = [];
    projectsProgress: any[] = [];
    isLoading = true;
    currentDate: string = '';
    previousStats: any = {};

    // Chart.js configurations
    private colors = {
        primary: '#3b82f6',
        secondary: '#06b6d4',
        accent: '#ec4899',
        success: '#10b981',
        warning: '#f59e0b',
        neutral: '#6b7280'
    };

    barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
    barChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 14, family: 'Inter', weight: '600' }, color: this.colors.neutral } },
            datalabels: { color: '#fff', font: { weight: 'bold', size: 12, family: 'Inter' }, formatter: (value) => value || '' },
            tooltip: { backgroundColor: this.colors.primary, titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' } }
        },
        scales: {
            x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral } },
            y: { stacked: true, beginAtZero: true, grid: { color: '#e5e7eb' }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral } }
        },
        animation: { duration: 1200, easing: 'easeOutCubic' },
        elements: { bar: { borderRadius: 8 } }
    };
    barChartPlugins = [ChartDataLabels];

    donutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
    donutChartOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { font: { size: 14, family: 'Inter', weight: '600' }, color: this.colors.neutral } },
            datalabels: {
                color: '#fff',
                font: { weight: 'bold', size: 14, family: 'Inter' },
                formatter: (value) => `${value}`,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 4,
                padding: 6
            },
            tooltip: { backgroundColor: this.colors.primary, titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' } }
        },
        animation: { duration: 1200, easing: 'easeOutCubic' },
        cutout: '75%'
    };
    donutChartPlugins = [ChartDataLabels];

    radarChartData: ChartData<'radar'> = { labels: [], datasets: [] };
    radarChartOptions: ChartOptions<'radar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 14, family: 'Inter', weight: '600' }, color: this.colors.neutral } },
            datalabels: { color: '#fff', font: { size: 12, family: 'Inter' }, formatter: (value) => value || '' },
            tooltip: { backgroundColor: this.colors.primary, titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' } }
        },
        scales: {
            r: {
                angleLines: { display: true, color: '#e5e7eb' },
                suggestedMin: 0,
                ticks: { backdropColor: 'transparent', font: { family: 'Inter', size: 12 }, color: this.colors.neutral },
                grid: { color: '#e5e7eb' }
            }
        },
        animation: { duration: 1200, easing: 'easeInOutQuad' },
        elements: { point: { radius: 4, hoverRadius: 8 } }
    };
    radarChartPlugins = [ChartDataLabels];

    gaugeChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
    gaugeChartOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        circumference: 180,
        rotation: -90,
        cutout: '85%',
        plugins: {
            legend: { display: false },
            datalabels: {
                display: true,
                color: this.colors.primary,
                font: { size: 28, weight: 'bold', family: 'Inter' },
                formatter: (value) => `${value}%`,
                anchor: 'center',
                align: 'center'
            },
            tooltip: { enabled: false }
        },
        animation: { duration: 1200, easing: 'easeOutCubic' }
    };

    lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
    lineChartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 14, family: 'Inter', weight: '600' }, color: this.colors.neutral } },
            datalabels: { display: false },
            tooltip: { backgroundColor: this.colors.primary, titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' } }
        },
        scales: {
            y: { beginAtZero: true, max: 100, grid: { color: '#e5e7eb' }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral } },
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral } }
        },
        animation: { duration: 1200, easing: 'easeInOutQuart' },
        elements: { line: { tension: 0.4 }, point: { radius: 5, hoverRadius: 8 } }
    };
    lineChartPlugins = [ChartDataLabels];

    resourceUtilizationChartData: ChartData<'line'> = { labels: [], datasets: [] };
    resourceUtilizationChartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 14, family: 'Inter', weight: '600' }, color: this.colors.neutral } },
            datalabels: { display: false },
            tooltip: { backgroundColor: this.colors.primary, titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' } }
        },
        scales: {
            y: { beginAtZero: true, max: 100, grid: { color: '#e5e7eb' }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral } },
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral } }
        },
        animation: { duration: 1200, easing: 'easeInOutQuart' },
        elements: { line: { tension: 0.4 }, point: { radius: 5, hoverRadius: 8 } }
    };
    resourceUtilizationChartPlugins = [ChartDataLabels];

    enginChartData: ChartData<'bar'> = { labels: [], datasets: [] };
    enginChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            datalabels: {
                color: '#fff',
                font: { weight: 'bold', size: 12, family: 'Inter' },
                formatter: (value) => value || '',
                anchor: 'end',
                align: 'top'
            },
            tooltip: { backgroundColor: this.colors.primary, titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral, maxRotation: 45, minRotation: 45 } },
            y: { beginAtZero: true, grid: { color: '#e5e7eb' }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral } }
        },
        animation: { duration: 1200, easing: 'easeOutCubic' },
        elements: { bar: { borderRadius: 4 } }
    };
    enginChartPlugins = [ChartDataLabels];

    mainOeuvreChartData: ChartData<'bar'> = { labels: [], datasets: [] };
    mainOeuvreChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            datalabels: {
                color: '#fff',
                font: { weight: 'bold', size: 12, family: 'Inter' },
                formatter: (value) => value || '',
                anchor: 'end',
                align: 'top'
            },
            tooltip: { backgroundColor: this.colors.secondary, titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral, maxRotation: 45, minRotation: 45 } },
            y: { beginAtZero: true, grid: { color: '#e5e7eb' }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral } }
        },
        animation: { duration: 1200, easing: 'easeOutCubic' },
        elements: { bar: { borderRadius: 4 } }
    };
    mainOeuvreChartPlugins = [ChartDataLabels];

    articleChartData: ChartData<'bar'> = { labels: [], datasets: [] };
    articleChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 14, family: 'Inter', weight: '600' }, color: this.colors.neutral } },
            datalabels: {
                color: '#fff',
                font: { weight: 'bold', size: 12, family: 'Inter' },
                formatter: (value) => value || '',
                anchor: 'end',
                align: 'top'
            },
            tooltip: { backgroundColor: this.colors.accent, titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral, maxRotation: 45, minRotation: 45 } },
            y: { beginAtZero: true, grid: { color: '#e5e7eb' }, ticks: { font: { family: 'Inter', size: 12 }, color: this.colors.neutral } }
        },
        animation: { duration: 1200, easing: 'easeOutCubic' },
        elements: { bar: { borderRadius: 4 } }
    };
    articleChartPlugins = [ChartDataLabels];

    private taskChangeSubscription: Subscription | undefined;

    constructor(
        private tacheService: TacheService,
        private srManagerService: SrManagerService,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.setCurrentDate();
        this.loadAllData();
        this.taskChangeSubscription = this.tacheService.taskChange$.subscribe(() => {
            this.loadAllData();
        });
    }

    ngOnDestroy(): void {
        if (this.taskChangeSubscription) {
            this.taskChangeSubscription.unsubscribe();
        }
    }

    setCurrentDate(): void {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        this.currentDate = now.toLocaleDateString('fr-FR', options);
    }

    loadAllData(): void {
        this.isLoading = true;
        this.srManagerService.getResources<Tache[]>(`${environment.Tache.query.getAll}`).subscribe(
            (taches: Tache[]) => {
                // Sanitize task data to align with TacheListComponent
                const sanitizedTaches = taches.map(tache => ({
                    ...tache,
                    dateDebut: tache.dateDebut ? new Date(tache.dateDebut) : null,
                    dateFin: tache.dateFin ? new Date(tache.dateFin) : null,
                    dureeTacheReelle: tache.dureeTacheReelle ?? 0,
                    percentAvancement: this.calculatePercentAvancement(tache)
                }));
                this.previousStats = {
                    totalTachesGlobales: this.totalTachesGlobales,
                    completedTaches: this.completedTaches,
                    enCoursTaches: this.enCoursTaches,
                    pendingTaches: this.pendingTaches,
                    overdueTaches: this.overdueTaches,
                    annuleTaches: this.annuleTaches,
                    enginCount: this.resourceStats.engin.count,
                    mainOeuvreWorkers: this.resourceStats.mainOeuvre.activeWorkers
                };
                this.recentTasks = this.sortTasksByDate(sanitizedTaches);
                this.filteredTasks = [...this.recentTasks];
                this.calculateStatistics(sanitizedTaches);
                this.generateChartData(sanitizedTaches);
                this.loadProjectsProgress(sanitizedTaches);
                this.loadAffaires(sanitizedTaches);
                this.applyFilters();
                this.updateCharts(sanitizedTaches);
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading dashboard data:', error);
                this.toastr.error('Erreur lors du chargement des données du tableau de bord');
                this.isLoading = false;
            }
        );
    }

    sortTasksByDate(tasks: Tache[]): Tache[] {
        return tasks
            .filter(task => task.dateDebut && !isNaN(new Date(task.dateDebut).getTime()))
            .sort((a, b) => {
                const dateA = new Date(a.dateDebut!).getTime();
                const dateB = new Date(b.dateDebut!).getTime();
                return dateB - dateA;
            });
    }

    calculateStatistics(taches: Tache[]): void {
        let filteredTaches = this.selectedAffaire === 'Toutes'
            ? taches
            : taches.filter(t => t.affaire?.nomAffaire === this.selectedAffaire);

        // Initialize counters
        this.totalTachesGlobales = filteredTaches.length;
        this.completedTaches = 0;
        this.pendingTaches = 0;
        this.enCoursTaches = 0;
        this.annuleTaches = 0;
        this.overdueTaches = 0;
        this.resourceStats = {
            engin: { count: 0, unique: 0, activeTasks: 0, utilizationRate: 0 },
            mainOeuvre: { totalHours: 0, avgHoursPerTask: 0, activeWorkers: 0, uniqueWorkers: 0, utilizationRate: 0 },
            lot: { count: 0, completionRate: 0, totalLots: 0 },
            article: { count: 0, totalArticles: 0, usageRate: 0 }
        };

        const uniqueEngins = new Set<string>();
        const uniqueWorkers = new Set<string>();
        let totalLots = 0;
        let completedLots = 0;
        let totalArticles = 0;
        let consumedArticles = 0;
        const now = new Date();

        filteredTaches.forEach(tache => {
            // Align status with TacheListComponent's logic
            const percent = tache.percentAvancement ?? 0;
            if (tache.statut === 'ANNULE') {
                this.annuleTaches++;
            } else {
                switch (true) {
                    case tache.statut === 'TERMINE' || percent >= 80:
                        this.completedTaches++;
                        tache.statut = Statut.TERMINE;
                        break;
                    case tache.statut === 'EN_ATTENTE' && percent === 0:
                        if (tache.dateDebut && new Date(tache.dateDebut) <= now) {
                            this.pendingTaches++;
                        }
                        break;
                    case tache.statut === 'EN_COURS' || (percent >= 30 && percent <= 79):
                        this.enCoursTaches++;
                        tache.statut = Statut.EN_COURS;
                        break;
                    case tache.statut === 'EN_RETARD' || (percent >= 1 && percent <= 29):
                        this.overdueTaches++;
                        tache.statut = Statut.EN_RETARD;
                        break;
                }
            }

            // Resources: Engins
            if (tache.engins && tache.engins.length > 0 && tache.statut !== 'ANNULE') {
                const enginCount = tache.engins.reduce((sum, engin) => sum + (engin.nbrEngin || 0), 0);
                this.resourceStats.engin.count += enginCount;
                if (tache.statut === 'EN_COURS') this.resourceStats.engin.activeTasks++;
                tache.engins.forEach(engin => uniqueEngins.add(engin.typeEngin || ''));
            }

            // Resources: Main d'Oeuvre
            if (tache.mainOeuvres && tache.mainOeuvres.length > 0 && tache.statut !== 'ANNULE') {
                const workers = tache.mainOeuvres.reduce((sum, mo) => sum + (mo.nbrMO || 0), 0);
                this.resourceStats.mainOeuvre.activeWorkers += workers;
                this.resourceStats.mainOeuvre.totalHours += workers * (tache.dureeTacheReelle || 1);
                tache.mainOeuvres.forEach(mo => uniqueWorkers.add(mo.fonctionMO || ''));
            }

            // Resources: Lots and Articles
            if (tache.lots && tache.lots.length > 0 && tache.statut !== 'ANNULE') {
                totalLots += tache.lots.length;
                if (tache.statut === 'TERMINE') completedLots += tache.lots.length;
                tache.lots.forEach(lot => {
                    this.resourceStats.lot.count++;
                    if (lot.articles && lot.articles.length > 0) {
                        totalArticles += lot.articles.reduce((sum, article) => sum + (article.quantiteArticle || 0), 0);
                        consumedArticles += lot.articles.reduce((sum, article) => sum + (article.quantiteArticleconsomme || 0), 0);
                    }
                });
            }
        });

        // Finalize resource stats
        this.resourceStats.engin.unique = uniqueEngins.size;
        this.resourceStats.mainOeuvre.uniqueWorkers = uniqueWorkers.size;
        this.resourceStats.lot.totalLots = totalLots;
        this.resourceStats.lot.completionRate = totalLots ? Math.round((completedLots / totalLots) * 100) : 0;
        this.resourceStats.article.totalArticles = totalArticles;
        this.resourceStats.article.usageRate = totalArticles ? Math.round((consumedArticles / totalArticles) * 100) : 0;
        this.resourceStats.mainOeuvre.avgHoursPerTask = filteredTaches.length ? this.resourceStats.mainOeuvre.totalHours / filteredTaches.length : 0;
        this.resourceStats.engin.utilizationRate = uniqueEngins.size ? Math.round((this.resourceStats.engin.count / (uniqueEngins.size * 10)) * 100) : 0;
        this.resourceStats.mainOeuvre.utilizationRate = uniqueWorkers.size ? Math.round((this.resourceStats.mainOeuvre.activeWorkers / (uniqueWorkers.size * 8)) * 100) : 0;

        // Status distribution
        const total = this.totalTachesGlobales || 1;
        this.statusDistribution = {
            termine: Math.round((this.completedTaches / total) * 100),
            enCours: Math.round((this.enCoursTaches / total) * 100),
            enAttente: Math.round((this.pendingTaches / total) * 100),
            annule: Math.round((this.annuleTaches / total) * 100),
            enRetard: Math.round((this.overdueTaches / total) * 100)
        };
    }

    generateChartData(taches: Tache[]): void {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        this.tachesByMonth = [];
        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const year = currentMonth - i >= 0 ? currentYear : currentYear - 1;
            const monthName = months[monthIndex];

            const filteredTaches = this.selectedAffaire === 'Toutes'
                ? taches
                : taches.filter(t => t.affaire?.nomAffaire === this.selectedAffaire);

            const nouvelles = filteredTaches.filter(tache => {
                if (!tache.dateDebut) return false;
                const taskDate = new Date(tache.dateDebut);
                return taskDate.getMonth() === monthIndex && taskDate.getFullYear() === year && !isNaN(taskDate.getTime());
            }).length;

            const terminees = filteredTaches.filter(tache => {
                if (!tache.dateFin) return false;
                const taskDate = new Date(tache.dateFin);
                return taskDate.getMonth() === monthIndex && taskDate.getFullYear() === year && tache.statut === 'TERMINE' && !isNaN(taskDate.getTime());
            }).length;

            const enCours = filteredTaches.filter(tache => {
                if (!tache.dateDebut) return false;
                const taskDate = new Date(tache.dateDebut);
                return taskDate.getMonth() === monthIndex && taskDate.getFullYear() === year && tache.statut === 'EN_COURS' && !isNaN(taskDate.getTime());
            }).length;

            const enAttente = filteredTaches.filter(tache => {
                if (!tache.dateDebut) return false;
                const taskDate = new Date(tache.dateDebut);
                return taskDate.getMonth() === monthIndex && taskDate.getFullYear() === year && tache.statut === 'EN_ATTENTE' && !isNaN(taskDate.getTime());
            }).length;

            const enRetard = filteredTaches.filter(tache => {
                if (!tache.dateDebut) return false;
                const taskDate = new Date(tache.dateDebut);
                return taskDate.getMonth() === monthIndex && taskDate.getFullYear() === year && tache.statut === 'EN_RETARD' && !isNaN(taskDate.getTime());
            }).length;

            this.tachesByMonth.push({ month: monthName, nouvelles, terminees, enCours, enAttente, enRetard });
        }
    }

    calculateEnginData(taches: Tache[]): { labels: string[], data: number[] } {
        const filteredTaches = this.selectedAffaire === 'Toutes'
            ? taches
            : taches.filter(t => t.affaire?.nomAffaire === this.selectedAffaire);

        const enginMap = new Map<string, number>();
        filteredTaches.forEach(tache => {
            if (tache.statut !== 'ANNULE' && tache.engins) {
                tache.engins.forEach(engin => {
                    const type = engin.typeEngin || 'Inconnu';
                    const current = enginMap.get(type) || 0;
                    enginMap.set(type, current + (engin.nbrEngin || 0));
                });
            }
        });

        const entries = Array.from(enginMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            labels: entries.map(([type]) => type),
            data: entries.map(([, count]) => count)
        };
    }

    calculateMainOeuvreData(taches: Tache[]): { labels: string[], data: number[] } {
        const filteredTaches = this.selectedAffaire === 'Toutes'
            ? taches
            : taches.filter(t => t.affaire?.nomAffaire === this.selectedAffaire);

        const mainOeuvreMap = new Map<string, number>();
        filteredTaches.forEach(tache => {
            if (tache.statut !== 'ANNULE' && tache.mainOeuvres) {
                tache.mainOeuvres.forEach(mo => {
                    const fonction = mo.fonctionMO || 'Inconnu';
                    const current = mainOeuvreMap.get(fonction) || 0;
                    mainOeuvreMap.set(fonction, current + (mo.nbrMO || 0));
                });
            }
        });

        const entries = Array.from(mainOeuvreMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            labels: entries.map(([fonction]) => fonction),
            data: entries.map(([, count]) => count)
        };
    }

    calculateArticleData(taches: Tache[]): { labels: string[], totalData: number[], consumedData: number[] } {
        const filteredTaches = this.selectedAffaire === 'Toutes'
            ? taches
            : taches.filter(t => t.affaire?.nomAffaire === this.selectedAffaire);

        const articleMap = new Map<string, { total: number, consumed: number }>();
        filteredTaches.forEach(tache => {
            if (tache.statut !== 'ANNULE' && tache.lots) {
                tache.lots.forEach(lot => {
                    if (lot.articles) {
                        lot.articles.forEach(article => {
                            const nom = article.nomArticle || 'Inconnu';
                            const current = articleMap.get(nom) || { total: 0, consumed: 0 };
                            articleMap.set(nom, {
                                total: current.total + (article.quantiteArticle || 0),
                                consumed: current.consumed + (article.quantiteArticleconsomme || 0)
                            });
                        });
                    }
                });
            }
        });

        const entries = Array.from(articleMap.entries())
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5);

        return {
            labels: entries.map(([nom]) => nom),
            totalData: entries.map(([, data]) => data.total),
            consumedData: entries.map(([, data]) => data.consumed)
        };
    }

    updateCharts(taches: Tache[]): void {
        // Bar Chart
        this.barChartData = {
            labels: this.tachesByMonth.map(m => m.month),
            datasets: [
                {
                    label: 'Terminé',
                    data: this.tachesByMonth.map(m => m.terminees),
                    backgroundColor: this.colors.success,
                    borderColor: this.colors.success,
                    borderWidth: 1
                },
                {
                    label: 'En Cours',
                    data: this.tachesByMonth.map(m => m.enCours),
                    backgroundColor: this.colors.warning,
                    borderColor: this.colors.warning,
                    borderWidth: 1
                },
                {
                    label: 'En Attente',
                    data: this.tachesByMonth.map(m => m.enAttente),
                    backgroundColor: this.colors.primary,
                    borderColor: this.colors.primary,
                    borderWidth: 1
                },
                {
                    label: 'En Retard',
                    data: this.tachesByMonth.map(m => m.enRetard),
                    backgroundColor: this.colors.accent,
                    borderColor: this.colors.accent,
                    borderWidth: 1
                }
            ]
        };

        // Donut Chart
        this.donutChartData = {
            labels: ['Engins', 'Main d\'Oeuvre', 'Lots'],
            datasets: [{
                data: [
                    this.resourceStats.engin.count,
                    this.resourceStats.mainOeuvre.activeWorkers,
                    this.resourceStats.lot.count
                ],
                backgroundColor: [this.colors.primary, this.colors.secondary, this.colors.accent],
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 2,
                hoverOffset: 30
            }]
        };

        // Radar Chart
        const radarData = this.calculateRadarData(taches);
        this.radarChartData = {
            labels: ['Terminé', 'En Cours', 'En Attente', 'En Retard'],
            datasets: radarData.datasets
        };

        // Gauge Chart
        const completionPercentage = this.calculateCompletionPercentage(taches);
        this.gaugeChartData = {
            labels: ['Complétion', 'Restant'],
            datasets: [{
                data: [completionPercentage, 100 - completionPercentage],
                backgroundColor: [this.colors.success, '#e5e7eb'],
                borderWidth: 0
            }]
        };

        // Line Chart
        const filteredTaches = this.selectedAffaire === 'Toutes'
            ? taches
            : taches.filter(t => t.affaire?.nomAffaire === this.selectedAffaire);
        const progressionData = this.calculateProgressionData(filteredTaches);
        this.lineChartData = {
            labels: progressionData.labels,
            datasets: [{
                label: 'Pourcentage d\'Avancement',
                data: progressionData.data,
                backgroundColor: this.colors.primary + '33',
                borderColor: this.colors.primary,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: this.colors.primary,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: this.colors.primary
            }]
        };

        // Resource Utilization Chart
        const utilizationData = this.calculateResourceUtilizationData(taches);
        this.resourceUtilizationChartData = {
            labels: utilizationData.labels,
            datasets: [
                {
                    label: 'Utilisation Engins (%)',
                    data: utilizationData.enginData,
                    backgroundColor: this.colors.secondary,
                    borderColor: this.colors.secondary,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.secondary,
                    pointBorderColor: '#fff'
                },
                {
                    label: 'Utilisation Main d\'Oeuvre (%)',
                    data: utilizationData.workerData,
                    backgroundColor: this.colors.accent,
                    borderColor: this.colors.accent,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.accent,
                    pointBorderColor: '#fff'
                }
            ]
        };

        // Engin Chart
        const enginData = this.calculateEnginData(taches);
        this.enginChartData = {
            labels: enginData.labels,
            datasets: [{
                label: 'Nombre d\'Engins',
                data: enginData.data,
                backgroundColor: this.colors.primary,
                borderColor: this.colors.primary,
                borderWidth: 1
            }]
        };

        // MainOeuvre Chart
        const mainOeuvreData = this.calculateMainOeuvreData(taches);
        this.mainOeuvreChartData = {
            labels: mainOeuvreData.labels,
            datasets: [{
                label: 'Nombre de Travailleurs',
                data: mainOeuvreData.data,
                backgroundColor: this.colors.secondary,
                borderColor: this.colors.secondary,
                borderWidth: 1
            }]
        };

        // Article Chart
        const articleData = this.calculateArticleData(taches);
        this.articleChartData = {
            labels: articleData.labels,
            datasets: [
                {
                    label: 'Quantité Totale',
                    data: articleData.totalData,
                    backgroundColor: this.colors.accent,
                    borderColor: this.colors.accent,
                    borderWidth: 1
                },
                {
                    label: 'Quantité Consommée',
                    data: articleData.consumedData,
                    backgroundColor: this.colors.warning,
                    borderColor: this.colors.warning,
                    borderWidth: 1
                }
            ]
        };
    }

    calculateRadarData(taches: Tache[]): { datasets: any[] } {
        const datasets = this.affaires
            .filter(a => a !== 'Toutes')
            .slice(0, 5)
            .map((affaire, index) => {
                const filteredTaches = taches.filter(t => t.affaire?.nomAffaire === affaire);
                const termine = filteredTaches.filter(t => t.statut === 'TERMINE').length;
                const enCours = filteredTaches.filter(t => t.statut === 'EN_COURS').length;
                const enAttente = filteredTaches.filter(t => t.statut === 'EN_ATTENTE').length;
                const enRetard = filteredTaches.filter(t => t.statut === 'EN_RETARD').length;
                const colors = [this.colors.primary, this.colors.secondary, this.colors.accent, this.colors.success, this.colors.warning];
                return {
                    label: affaire,
                    data: [termine, enCours, enAttente, enRetard],
                    backgroundColor: `${colors[index % colors.length]}33`,
                    borderColor: colors[index % colors.length],
                    pointBackgroundColor: colors[index % colors.length]
                };
            });
        return { datasets };
    }

    calculateCompletionPercentage(taches: Tache[]): number {
        const filteredTaches = this.selectedAffaire === 'Toutes'
            ? taches
            : taches.filter(t => t.affaire?.nomAffaire === this.selectedAffaire);
        const totalTasks = filteredTaches.length || 1;
        let totalProgress = 0;
        filteredTaches.forEach(tache => {
            if (tache.statut !== 'ANNULE') {
                totalProgress += tache.percentAvancement || (tache.statut === 'TERMINE' ? 100 : tache.statut === 'EN_COURS' ? 50 : tache.statut === 'EN_RETARD' ? 25 : 0);
            }
        });
        return Math.round(totalProgress / totalTasks);
    }

    calculateProgressionData(taches: Tache[]): { labels: string[], data: number[] } {
        const labels: string[] = [];
        const data: number[] = [];
        const sortedTaches = taches
            .filter(t => t.dateDebut && (t.percentAvancement !== undefined || t.statut) && t.statut !== 'ANNULE')
            .sort((a, b) => new Date(a.dateDebut!).getTime() - new Date(b.dateDebut!).getTime());

        sortedTaches.forEach(tache => {
            const date = new Date(tache.dateDebut!);
            const label = `${date.getDate()}/${date.getMonth() + 1}`;
            labels.push(label);
            const progress = tache.percentAvancement ?? (tache.statut === 'TERMINE' ? 100 : tache.statut === 'EN_COURS' ? 50 : tache.statut === 'EN_RETARD' ? 25 : 0);
            data.push(progress);
        });

        return { labels, data };
    }

    calculateResourceUtilizationData(taches: Tache[]): { labels: string[], enginData: number[], workerData: number[] } {
        const labels: string[] = [];
        const enginData: number[] = [];
        const workerData: number[] = [];
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const year = currentMonth - i >= 0 ? currentYear : currentYear - 1;
            const monthName = months[monthIndex];

            const filteredTaches = this.selectedAffaire === 'Toutes'
                ? taches
                : taches.filter(t => t.affaire?.nomAffaire === this.selectedAffaire);

            let enginCount = 0;
            let workerHours = 0;

            filteredTaches.forEach(tache => {
                if (!tache.dateDebut || tache.statut === 'ANNULE') return;
                const taskDate = new Date(tache.dateDebut);
                if (taskDate.getMonth() === monthIndex && taskDate.getFullYear() === year && !isNaN(taskDate.getTime())) {
                    if (tache.engins) {
                        enginCount += tache.engins.reduce((sum, engin) => sum + (engin.nbrEngin || 0), 0);
                    }
                    if (tache.mainOeuvres) {
                        workerHours += tache.mainOeuvres.reduce((sum, mo) => sum + (mo.nbrMO || 0), 0);
                    }
                }
            });

            const uniqueEngins = new Set<string>();
            const uniqueWorkers = new Set<string>();
            filteredTaches.forEach(tache => {
                if (tache.statut !== 'ANNULE') {
                    if (tache.engins) tache.engins.forEach(engin => uniqueEngins.add(engin.typeEngin || ''));
                    if (tache.mainOeuvres) tache.mainOeuvres.forEach(mo => uniqueWorkers.add(mo.fonctionMO || ''));
                }
            });

            const maxEngins = uniqueEngins.size * 10;
            const maxWorkers = uniqueWorkers.size * 8;
            const enginUtilization = maxEngins ? Math.round((enginCount / maxEngins) * 100) : 0;
            const workerUtilization = maxWorkers ? Math.round((workerHours / maxWorkers) * 100) : 0;

            labels.push(monthName);
            enginData.push(enginUtilization);
            workerData.push(workerUtilization);
        }

        return { labels, enginData, workerData };
    }

    loadProjectsProgress(taches: Tache[]): void {
        const projectNames = Array.from(
            new Set(taches
                .filter(t => t.affaire?.nomAffaire && t.statut !== 'ANNULE')
                .map(t => t.affaire!.nomAffaire))
        );

        this.projectsProgress = projectNames.map(projectName => {
            const projectTasks = taches.filter(t => t.affaire?.nomAffaire === projectName && t.statut !== 'ANNULE');
            let totalProgress = 0;
            let totalLots = 0;
            let completedLots = 0;

            projectTasks.forEach(tache => {
                totalProgress += tache.percentAvancement || (tache.statut === 'TERMINE' ? 100 : tache.statut === 'EN_COURS' ? 50 : tache.statut === 'EN_RETARD' ? 25 : 0);
                if (tache.lots) {
                    totalLots += tache.lots.length;
                    if (tache.statut === 'TERMINE') completedLots += tache.lots.length;
                }
            });

            const totalTasks = projectTasks.length || 1;
            const percentage = Math.round(totalProgress / totalTasks);
            const lotCompletion = totalLots ? Math.round((completedLots / totalLots) * 100) : 0;

            return {
                name: projectName,
                percentage,
                completedCount: projectTasks.filter(t => t.statut === 'TERMINE').length,
                totalCount: totalTasks,
                lotCompletion
            };
        }).slice(0, 4);
    }

    loadAffaires(taches: Tache[]): void {
        this.affaires = ['Toutes', ...Array.from(
            new Set(taches
                .filter(t => t.affaire?.nomAffaire)
                .map(t => t.affaire!.nomAffaire))
        )];
    }

    applyFilters(): void {
        let tasks = [...this.recentTasks];
        if (this.currentFilter !== 'Toutes') {
            const statusMap: { [key: string]: string } = {
                'Terminées': 'TERMINE',
                'En Cours': 'EN_COURS',
                'En Attente': 'EN_ATTENTE',
                'Annulées': 'ANNULE',
                'En Retard': 'EN_RETARD'
            };
            const statusFilter = statusMap[this.currentFilter];
            tasks = tasks.filter(task => task.statut === statusFilter);
        }

        if (this.selectedAffaire !== 'Toutes') {
            tasks = tasks.filter(task => task.affaire?.nomAffaire === this.selectedAffaire);
        }

        this.filteredTasks = tasks;
        this.calculateStatistics(this.recentTasks);
        this.generateChartData(this.recentTasks);
        this.updateCharts(this.recentTasks);
    }

    filterTasks(filter: string): void {
        this.currentFilter = filter;
        this.applyFilters();
    }

    filterByAffaire(affaire: string): void {
        this.selectedAffaire = affaire;
        this.applyFilters();
    }

    calculatePercentageChange(current: number, previous: number): number {
        if (!previous || previous === current) return 0;
        return ((current - previous) / previous) * 100;
    }

    formatPercentageChange(current: number, previous: number): string {
        const change = this.calculatePercentageChange(current, previous);
        if (change === 0) return '0.0';
        return change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
    }

    formatDate(date: any): string {
        if (!date) return '';
        const d = new Date(date);
        return isNaN(d.getTime()) ? '' :
            `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }

    getGradient(project: any): string {
        const gradients = [
            `linear-gradient(135deg, ${this.colors.primary}, ${this.colors.primary}cc)`,
            `linear-gradient(135deg, ${this.colors.secondary}, ${this.colors.secondary}cc)`,
            `linear-gradient(135deg, ${this.colors.accent}, ${this.colors.accent}cc)`,
            `linear-gradient(135deg, ${this.colors.warning}, ${this.colors.warning}cc)`
        ];
        const index = this.projectsProgress.indexOf(project) % gradients.length;
        return gradients[index];
    }

    calculatePercentAvancement(tache: Tache): number {
        if (!tache) return 0;

        const dureePrevu = this.calculateDureePrevu(tache);
        const dureeReelle = tache.dureeTacheReelle ?? 0;

        if (!dureePrevu || dureePrevu <= 0) {
            tache.statut = Statut.EN_ATTENTE;
            return 0;
        }

        let progression = 0;

        if (dureeReelle === 0) {
            tache.statut = Statut.EN_ATTENTE;
            progression = 0;
        } else if (dureeReelle === dureePrevu || tache.statut === 'TERMINE') {
            tache.statut = Statut.TERMINE;
            progression = 100;
        } else if (dureeReelle > dureePrevu) {
            tache.statut = Statut.EN_RETARD;
            progression = Math.min((dureeReelle / dureePrevu) * 100, 100);
        } else if (dureeReelle < dureePrevu) {
            tache.statut = Statut.EN_COURS;
            progression = (dureeReelle / dureePrevu) * 100;
        }

        return Math.round(Math.max(0, Math.min(100, progression)));
    }

    calculateDureePrevu(tache: Tache): number {
        if (!tache?.dateDebut || !tache?.dateFin) return 0;
        const debut = new Date(tache.dateDebut);
        const fin = new Date(tache.dateFin);
        if (isNaN(debut.getTime()) || isNaN(fin.getTime())) return 0;
        const diffInMs = fin.getTime() - debut.getTime();
        const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
        return days >= 0 ? days : 0;
    }
}