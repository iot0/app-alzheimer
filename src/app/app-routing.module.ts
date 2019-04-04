import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginGuard } from "./shared/guards/login.guard";

const routes: Routes = [
  { path: "", redirectTo: "welcome", pathMatch: "full" },
  {
    path: "home",
    loadChildren: "./home/home.module#HomePageModule",
    canActivate: [LoginGuard],
    canLoad: [LoginGuard]
  },
  {
    path: "login",
    loadChildren: "./login/login.module#LoginPageModule",
    canActivate: [LoginGuard],
    canLoad: [LoginGuard]
  },
  {
    path: "register",
    loadChildren: "./register/register.module#RegisterPageModule"
  },
  {
    path: "profile",
    loadChildren: "./profile/profile.module#ProfilePageModule"
  },
  {
    path: "welcome",
    loadChildren: "./welcome/welcome.module#WelcomePageModule"
  },
  { path: "events", loadChildren: "./events/events.module#EventsPageModule" },
  { path: 'patient', loadChildren: './patient/patient.module#PatientPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
