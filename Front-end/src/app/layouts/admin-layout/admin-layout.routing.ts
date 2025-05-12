import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { StatisticsComponent } from '../../statistics/statistics.component';
import { ActivityComponent } from '../../activity/activity.component';
import { NewTransactionComponent } from '../../new-transaction/new-transaction.component';
import { SettingsComponent } from '../../settings/settings.component';
import { SupportComponent } from '../../support/support.component';
import { PrivacyComponent } from '../../privacy/privacy.component';
import { AboutUsComponent } from '../../about-us/about-us.component';
import { ContactUsComponent } from '../../contact-us/contact-us.component';
import { NotesComponent } from '../../notes/notes.component';
import { AdviceComponent } from '../../advice/advice.component';
import { ExpenseTableComponent } from '../../expense-table/expense-table.component';
import { IncomeTableComponent } from '../../income-table/income-table.component';


import { EditTransactionComponent } from '../../edit-transaction/edit-transaction.component';

import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'statistics', component: StatisticsComponent },
    { path: 'activity', component: ActivityComponent},
    { path: 'new-transaction', component: NewTransactionComponent },
    { path: 'edit-transaction/:id', component: EditTransactionComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'support', component: SupportComponent },
    { path: 'privacy', component: PrivacyComponent },
    { path: 'about-us', component: AboutUsComponent },
    { path: 'contact-us', component: ContactUsComponent },
    { path: 'notes', component: NotesComponent },
    { path: 'advice', component: AdviceComponent },
    { path: 'expense-table', component: ExpenseTableComponent },
    { path: 'income-table', component: IncomeTableComponent },

    
    { path: 'user-profile',   component: UserProfileComponent },
    { path: 'tables',         component: TablesComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'maps',           component: MapsComponent }
];
