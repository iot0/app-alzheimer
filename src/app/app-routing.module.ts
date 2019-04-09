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
    loadChildren: "./welcome/welcome.module#WelcomePageModule",
    canActivate: [LoginGuard],
    canLoad: [LoginGuard]
  },
  { path: "events", loadChildren: "./events/events.module#EventsPageModule", canActivate: [LoginGuard], canLoad: [LoginGuard] },
  { path: "patient", redirectTo: "patient/", canActivate: [LoginGuard], canLoad: [LoginGuard] },
  { path: "patient/:id", loadChildren: "./patient/patient.module#PatientPageModule", canActivate: [LoginGuard], canLoad: [LoginGuard] },
  { path: "families/:pid", loadChildren: "./families/families.module#FamiliesPageModule", canActivate: [LoginGuard], canLoad: [LoginGuard] },
  { path: "family/:pid/:fid", loadChildren: "./family/family.module#FamilyPageModule", canActivate: [LoginGuard], canLoad: [LoginGuard] },
  { path: "family/:pid", loadChildren: "./family/family.module#FamilyPageModule", canActivate: [LoginGuard], canLoad: [LoginGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
