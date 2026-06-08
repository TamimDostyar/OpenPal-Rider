package openpal.controllers;

// for the actual springboot
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import java.util.List;
import java.util.stream.Collectors;


@RestController
public class AllSystemsEndpoints {

    private final RequestMappingHandlerMapping handleMapping;

    public AllSystemsEndpoints(RequestMappingHandlerMapping handleMapping){
        this.handleMapping = handleMapping;
    }

    @GetMapping("/api/all-endpoints")
    public List<String> allEndpoints(){
        return handleMapping.getHandlerMethods().keySet().stream()
    
                .flatMap(info -> info.getPathPatternsCondition()
                        .getPatterns().stream()
                        .map(p -> info.getMethodsCondition() + " " + p)

                ).sorted().collect(Collectors.toList());
    }

}