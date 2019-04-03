import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AngularFireAuth } from "@angular/fire/auth";
import { ThemeService } from "../shared/theme/theme.service";
import { User, UserRole } from "../shared/models/user";
import { UserService } from "../shared/services/user.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private userService: UserService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ["", Validators.required],
      password: ["", Validators.required],
      fullName: ["", Validators.required]
    });
  }

  ngOnInit() {}

  async onRegister() {
    // 1. Check form validity
    if (this.registerForm.valid) {
      // 2. show progress indicator
      await this.themeService.progress(true);

      try {
        // 3. get the values to variable from the form variable
        const { email, password, fullName } = this.registerForm.value;

        let user: User = {
          EmailId: email,
          Password: password,
          FullName: fullName,
          Role: UserRole.CareTaker
        };
        // 4. finally call firebase registration method
        const res = await this.userService.register(user);
        console.log(res);
        await this.themeService.alert(
          "Success",
          "User registration Successful , Now you can login with your registered email and password ."
        );
        this.router.navigate(["login"]);
      } catch (err) {
        // 5. handle error , showing error message
        console.dir(err);
        await this.themeService.toast(err.message);
      } finally {
        // 6. finally hide the progress indicator .
        await this.themeService.progress(false);
      }
    }
  }
}
