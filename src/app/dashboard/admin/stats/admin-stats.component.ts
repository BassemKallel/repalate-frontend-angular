import { Component } from '@angular/core';

interface StatTile {
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
}

@Component({
  selector: 'app-admin-stats',
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.scss']
})
export class AdminStatsComponent {
  statTiles: StatTile[] = [
    { label: 'Total utilisateurs', value: '1 248', trend: '+8% vs. semaine dernière', trendUp: true },
    { label: 'Comptes validés', value: '932', trend: '+3% sur 7 jours', trendUp: true },
    { label: 'Demandes en attente', value: '21', trend: '-5% vs. hier', trendUp: true },
    { label: "Alertes traitées", value: '57', trend: '-12% ce mois', trendUp: false }
  ];
}
