import { Component } from '@angular/core';

interface SignalItem {
  reporter: string;
  reason: string;
  createdAt: string;
  status: 'Ouvert' | 'En cours' | 'Résolu';
}

@Component({
  selector: 'app-admin-signals',
  templateUrl: './admin-signals.component.html',
  styleUrls: ['./admin-signals.component.scss']
})
export class AdminSignalsComponent {
  signals: SignalItem[] = [
    { reporter: 'Claire D.', reason: 'Contenu frauduleux', createdAt: '12/11/2025', status: 'Ouvert' },
    { reporter: 'Association Nord', reason: 'Spam', createdAt: '11/11/2025', status: 'En cours' },
    { reporter: 'Paul M.', reason: 'Langage inapproprié', createdAt: '09/11/2025', status: 'Résolu' }
  ];
}
