package org.unestilodevida.backend;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Este metodo le dice a Spring dónde buscar los archivos cuando alguien accede a /usuarios_fotos_perfil/**
        registry.addResourceHandler("/usuarios_fotos_perfil/**")
                .addResourceLocations("file:usuarios_fotos_perfil/");
    }
}
